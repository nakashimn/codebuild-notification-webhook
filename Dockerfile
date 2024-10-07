FROM public.ecr.aws/lambda/nodejs:20 as prod

COPY ./package*.json /
COPY ./src/app.js ${LAMBDA_TASK_ROOT}

RUN npm ci

CMD [ "app.handler" ]
