# Base Deno image
FROM denoland/deno:2.0.0

# Install Git + Node + Chromium (for mermaid-cli SSG rendering)
RUN apt-get update \
    && apt-get install -y git curl chromium fonts-liberation \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Lume + mermaid-cli globally
RUN deno install -A -f --name lume https://deno.land/x/lume/cli.ts --global \
    && npm install -g @mermaid-js/mermaid-cli@11

WORKDIR /site

# Copy project
COPY . .

# Expose dev server port
EXPOSE 3000

# Run the server on host=0.0.0.0 inside Docker
CMD ["deno", "task", "serve", "--", "--host", "0.0.0.0", "--port", "3000"]

