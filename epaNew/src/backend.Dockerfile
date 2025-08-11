# Backend: Express + Sequelize (SQLite)
FROM node:20-alpine
WORKDIR /app

# package.json is one level up from src (repo root)
COPY package*.json ./
RUN npm ci

# bring in source
COPY ./src ./src

ENV NODE_ENV=production
ENV PORT=5001
# Optional: if you later change Sequelize to read env, you can persist DB:
# ENV SQLITE_PATH=/data/database.sqlite

EXPOSE 5001
CMD ["node", "src/server.js"]
