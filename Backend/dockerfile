FROM node:16
WORKDIR /app
# Installer les dépendances
COPY package*.json ./
RUN npm install
# Copier l'application dans le conteneur
COPY . .
#
EXPOSE 3333