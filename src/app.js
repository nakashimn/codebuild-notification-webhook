const axios = require('axios');
const Logger = require('node-json-logger');
const logger = new Logger();

exports.handler = async (event) => {
    // const
    const appName = process.env.APP_NAME ?? 'CodebuildNotification';
    const account = event.account;
    const region = event.region;
    const buildDetails = event.detail;
    const projectName = buildDetails['project-name'];
    const buildStatus = buildDetails['build-status'];
    const buildId = buildDetails['build-id'];
    const buildNumber = buildDetails['additional-information']['build-number'];
    const currentPhaseContext = buildDetails['current-phase-context'];
    const webhookUrl = process.env.WEBHOOK_URL;
    const messages = {
        'IN_PROGRESS': process.env.IN_PROGRESS_MESSAGE ?? 'The build has started.',
        'SUCCEEDED': process.env.SUCCEEDED_MESSAGE ?? 'The build completed successfully.',
        'FAILED': process.env.FAILED_MESSAGE ?? 'The build failed.'
    };

    // construct project title
    var projectTitle = projectName;
    if (buildNumber != null) {
        projectTitle += `:${buildNumber}`;
    }

    // construct Codebuild URL
    const codebuildPageUrl = `https://${region}.console.aws.amazon.com/codesuite/codebuild/${account}/projects/${projectName}`;

    // logging
    logger.debug({"project-name": projectTitle});
    logger.debug({"build-id": buildId});
    logger.debug({"build-status": buildStatus});
    logger.debug({"codebuild-url": codebuildPageUrl});
    logger.debug({"current-phase-context": currentPhaseContext});
    logger.debug({"webhook-url": webhookUrl});

    // notification
    const message = {
        text: `[${projectTitle}]\n${messages[buildStatus]}\n${codebuildPageUrl}`
    };
    const headers = {'Content-Type': 'application/json'};
    await axios.post(webhookUrl, message, headers)
    .then(response => {
        logger.debug('Succeed to send message.', {data: response.data});
    })
    .catch(error => {
        logger.error('Failed to send message.', {error: error});
    });

    // response
    const response = {
        statusCode: 200,
        body: JSON.stringify({
            'project-name': projectTitle,
            'build-id': buildId,
            'build-status': buildStatus
        })
    };
    return response;
};
