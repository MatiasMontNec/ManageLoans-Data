FROM nginx:stable-alpine

COPY dist /usr/share/nginx/html

COPY frontend.conf /etc/nginx/conf.d/frontend.conf

CMD ["nginx", "-g", "daemon off;"]