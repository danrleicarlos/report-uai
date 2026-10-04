FROM node:20-alpine
WORKDIR /app
COPY . .
ENV NODE_ENV=production DATA_DIR=/dados/data BACKUP_DIR=/dados/backups
VOLUME ["/dados"]
EXPOSE 3000
CMD ["node", "server.js"]
