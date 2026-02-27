# Template Lab — static site (GitHub Pages)

This is a tiny, static compliance-friendly website for **Template Lab**.

- Domain: **templatelab.uk** (to be pointed at GitHub Pages)
- Storefront: https://templatelab.lemonsqueezy.com
- Contact: hello@waseemilyas.uk

## Files

- `index.html` — home, product examples, fulfilment/support
- `terms.html` — terms
- `privacy.html` — privacy policy
- `assets/site.css` — styling
- `assets/site.js` — sets the current year
- `assets/` — logos

## Publish with GitHub Pages

### Option A — publish from a repository root

1. Create a new GitHub repo, e.g. `templatelab-site`.
2. Commit these files to the repo root.
3. In GitHub: **Settings → Pages**
4. **Build and deployment** → Source: **Deploy from a branch**
5. Branch: `main` (or `master`) and folder: `/ (root)`
6. Save. Wait for deployment.

### Option B — publish from `/docs`

If you prefer, you can put everything under a `docs/` folder and set Pages to deploy from `/docs`.

## Connect the custom domain (templatelab.uk)

In GitHub **Settings → Pages**:

1. Set **Custom domain** to `templatelab.uk`
2. Enable **Enforce HTTPS** (after DNS propagates)

Then update DNS at your domain registrar:

- For an apex/root domain, GitHub Pages typically uses A records:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`

(Confirm the current recommended values in GitHub’s docs.)

GitHub will create a `CNAME` file automatically when you set the custom domain in the UI.

## Local preview

You can open `index.html` directly in a browser, or run a quick local server:

```bash
cd /Users/waseem/clawd/projects/templatelab-site
python3 -m http.server 8000
```

Then visit: http://localhost:8000

## Product Manifest Generator

Generate a CSV manifest from product folders:

```bash
npm run generate:product-manifest -- --root "/path/to/products" --output "./product-manifest.csv"
```

Required folder layout:

- Root directory contains category folders (for example: `spreadsheet-templates/`).
- Each category folder contains product folders (for example: `budget-tracker/`).
- A product is considered valid when it has:
  - a product file (any non-hidden file that is not named `preview.png/.jpg/.jpeg/.webp`)
  - a preview file named `preview.png`, `preview.jpg`, `preview.jpeg`, or `preview.webp`

Manifest columns include product name, category, product path, required-file flags, and missing-required-file details.
