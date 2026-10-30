# De huidige, statische Rijksmap als container, voor Sliplane (story R2-2).
# Serveert de bestanden van deze repository ongewijzigd, zoals GitHub Pages dat doet,
# met vooraf gecomprimeerde .gz-versies. Geen database, geen schijf, geen bezoekerslog.
#
# Op je eigen computer (alleen Docker nodig):
#   docker build -t rijksmap-site -f hosting/site/Dockerfile https://github.com/Robert-Worm/rijksmap.git#main
#   docker run --rm -p 8080:8080 rijksmap-site
#   en open http://localhost:8080
#
# Dezelfde vastgepinde Node-image als Omnibus (hosting/container/Dockerfile daar); houd beide stappen gelijk.
FROM node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20 AS bouw
WORKDIR /bron
COPY . .
RUN rm -rf .git && node hosting/site/comprimeer.mjs /bron

FROM node:24.21.0-bookworm-slim@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20
ENV NODE_ENV=production
COPY --from=bouw --chown=root:root --chmod=a-w /bron /app/site
COPY --chown=root:root --chmod=a-w hosting/site/server.mjs /app/server.mjs
USER 1000:1000
EXPOSE 8080
ENV SITE_ROOT=/app/site
# PORT geeft de host door. PUBLIC_ORIGIN en REDIRECT_HOSTS zijn optioneel (zie hosting/site/README.md).
CMD ["node", "--max-old-space-size=64", "/app/server.mjs"]
