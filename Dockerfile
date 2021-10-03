# development
FROM node:12.18.4 As development

ENV LANG C.UTF-8
ENV TZ Asia/Ho_Chi_Minh

WORKDIR /code

COPY . .

RUN yarn install --only=development
RUN yarn build


# production
FROM node:12.18.4 as production

ENV LANG C.UTF-8
ENV TZ Asia/Ho_Chi_Minh

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /code

COPY . .

RUN yarn install --only=production
COPY --from=development /code/dist ./dist

EXPOSE 7000

CMD ["node", "dist/main"]