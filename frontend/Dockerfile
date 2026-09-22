FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ENV API_INTERNAL_ORIGIN=http://api:8000
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
