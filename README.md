# Tactlab

Tactlab is a tool to analyze your performance in CS2 using Twelvelabs Pegasus (Twelvelabs interview techincal assignment)

## 🚀 Quick Start

### Docker Setup (Recommended)

1. **Obtain required credentials:**
   - Get your **Twelvelabs Index ID and API Key** (see [Twelvelabs](https://docs.twelvelabs.io/v1.3/docs/advanced/organizations/users-guide#create-api-keys))
   - Get your **Clerk credentials** (see [Clerk](https://clerk.com/glossary/api-key))

2. **Run the setup script:**

   ```bash
   curl https://raw.githubusercontent.com/arithefirst/Tactlab/refs/heads/main/setup.sh -o setup.sh && sh setup.sh
   ```

   The script will download the latest docker-compose.yml and prompt you for required environment variables (Minio, Clerk, Twelvelabs, and PostgreSQL credentials).

3. **Start the stack:**

   ```bash
   docker-compose up -d
   ```

   This will launch all services in the background.

4. **Access the app:**  
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Manual (Non-Docker) Setup

1. **Obtain required credentials:**
   - Get your **Twelvelabs Index ID and API Key** (see [Twelvelabs](https://docs.twelvelabs.io/v1.3/docs/advanced/organizations/users-guide#create-api-keys))
   - Get your **Clerk credentials** (see [Clerk](https://clerk.com/glossary/api-key))

2. **Install dependencies:**  
   Make sure you have [Bun](https://bun.sh/) installed.  
   Run:

   ```bash
   bun install
   ```

3. **Configure environment variables:**  
   Copy .env.example to .env and fill in all required values (S3, Clerk, Twelvelabs, PostgreSQL).

4. **Build the app:**

   ```bash
   bun run build
   ```

5. **Start the app:**

   ```bash
   bun run start
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## 📄 License

See [LICENSE](/LICENSE) for details.
