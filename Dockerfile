########################################################################################
# Builder
########################################################################################
FROM public.ecr.aws/lambda/nodejs:20 as builder

COPY ./package*.json /
RUN npm ci

########################################################################################
# Development
########################################################################################
FROM public.ecr.aws/lambda/nodejs:20 as dev

RUN echo sslverify=false >> /etc/dnf/dnf.conf
RUN dnf install -y \
    git \
    tar

COPY --from=builder /node_modules /node_modules

CMD [ "/bin/bash" ]

########################################################################################
# Production
########################################################################################
FROM public.ecr.aws/lambda/nodejs:20 as prod

COPY --from=builder /node_modules /node_modules
COPY ./src/app.js ${LAMBDA_TASK_ROOT}

CMD [ "app.handler" ]
