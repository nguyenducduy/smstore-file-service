FROM node:12.13-alpine As development

ENV LANG C.UTF-8
ENV TZ Asia/Ho_Chi_Minh

WORKDIR /code

COPY package*.json ./

RUN npm install --only=development

COPY . .

RUN npm run build

FROM node:12.13-alpine as production

ENV LANG C.UTF-8
ENV TZ Asia/Ho_Chi_Minh

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /code

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /code/dist ./dist

EXPOSE 7000

CMD ["node", "dist/main"]