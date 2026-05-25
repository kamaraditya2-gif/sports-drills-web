FROM nginx:alpine
COPY . /usr/share/nginx/html/
RUN sed -i 's/index  index.html/index  gandooz.html index.html/' /etc/nginx/conf.d/default.conf
EXPOSE 80
