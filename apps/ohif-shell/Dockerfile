FROM node:20.9.0-alpine AS builder

RUN corepack enable && corepack prepare yarn@4.0.0 --activate

WORKDIR /build

COPY vendor/ohif-viewers/ ./ohif-viewers/
COPY vendor/monai-label/plugins/ohifv3/extensions/monai-label/ ./ohif-viewers/extensions/monai-label/
COPY vendor/monai-label/plugins/ohifv3/modes/monai-label/ ./ohif-viewers/modes/monai-label/
COPY apps/ohif-shell/config/medicalpower.js ./ohif-viewers/platform/app/public/config/medicalpower.js

WORKDIR /build/ohif-viewers

RUN yarn install --frozen-lockfile || yarn install

ENV APP_CONFIG=config/medicalpower.js
ENV PUBLIC_URL=/ohif/

RUN yarn run build

FROM nginx:1.27-alpine

COPY --from=builder /build/ohif-viewers/platform/app/dist /usr/share/nginx/html

COPY apps/ohif-shell/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
