FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm ci --fetch-retries=5 --fetch-retry-factor=2 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000


FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL=http://mini-amazon-alb-215385300.eu-north-1.elb.amazonaws.com/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public            ./public
COPY --from=builder /app/.next/standalone  ./
COPY --from=builder /app/.next/static      ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]