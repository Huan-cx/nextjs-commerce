<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml/links"
                version="1.0">
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>

    <xsl:template match="/">
        <html>
            <head>
                <title>Sitemap</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:
                    #f5f5f5; color: #333; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding:
                    30px; border-radius: 12px; margin-bottom: 24px; }
                    .header h1 { font-size: 28px; margin-bottom: 8px; }
                    .header p { opacity: 0.9; font-size: 14px; }
                    .stats { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                    .stat-card { background: white; border-radius: 10px; padding: 16px 24px; box-shadow: 0 2px 8px
                    rgba(0,0,0,0.08); flex: 1; min-width: 140px; }
                    .stat-card .number { font-size: 28px; font-weight: 700; color: #667eea; }
                    .stat-card .label { font-size: 13px; color: #888; margin-top: 4px; }
                    .filters { background: white; border-radius: 10px; padding: 16px; margin-bottom: 20px; box-shadow: 0
                    2px 8px rgba(0,0,0,0.08); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
                    .filters input { padding: 8px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;
                    flex: 1; min-width: 200px; }
                    .filters input:focus { outline: none; border-color: #667eea; }
                    .filter-btn { padding: 6px 16px; border: 1px solid #ddd; border-radius: 20px; background: white;
                    cursor: pointer; font-size: 13px; transition: all 0.2s; }
                    .filter-btn:hover, .filter-btn.active { background: #667eea; color: white; border-color: #667eea; }
                    table { width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow:
                    hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                    th { background: #f8f9fa; padding: 14px 16px; text-align: left; font-size: 13px; color: #666;
                    text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #eee; }
                    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; vertical-align: top; }
                    tr:hover td { background: #f8f9ff; }
                    .url-link { color: #667eea; text-decoration: none; word-break: break-all; }
                    .url-link:hover { text-decoration: underline; }
                    .type-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px;
                    font-weight: 600; text-transform: uppercase; }
                    .type-home { background: #e8f5e9; color: #2e7d32; }
                    .type-product { background: #e3f2fd; color: #1565c0; }
                    .type-category { background: #fff3e0; color: #e65100; }
                    .type-article { background: #f3e5f5; color: #7b1fa2; }
                    .type-search { background: #fce4ec; color: #c62828; }
                    .type-page { background: #e0f2f1; color: #00695c; }
                    .alt-list { font-size: 11px; color: #888; }
                    .alt-list span { display: inline-block; background: #f0f0f0; padding: 1px 6px; border-radius: 4px;
                    margin: 1px 2px; }
                    .hidden { display: none !important; }
                    .count-info { color: #888; font-size: 13px; padding: 10px 0; }
                    .empty-row { text-align: center; padding: 40px; color: #999; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Sitemap</h1>
                    <p>Total:
                        <xsl:value-of select="count(s:urlset/s:url)"/>
                        URLs | Last updated:
                        <xsl:value-of select="s:urlset/s:url[1]/s:lastmod"/>
                    </p>
                </div>

                <div class="stats">
                    <div class="stat-card">
                        <div class="number">
                            <xsl:value-of select="count(s:urlset/s:url[s:type='home'])"/>
                        </div>
                        <div class="label">Home</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">
                            <xsl:value-of select="count(s:urlset/s:url[s:type='product'])"/>
                        </div>
                        <div class="label">Products</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">
                            <xsl:value-of select="count(s:urlset/s:url[s:type='category'])"/>
                        </div>
                        <div class="label">Categories</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">
                            <xsl:value-of select="count(s:urlset/s:url[s:type='article'])"/>
                        </div>
                        <div class="label">Articles</div>
                    </div>
                    <div class="stat-card">
                        <div class="number">
                            <xsl:value-of select="count(s:urlset/s:url[s:type='search'])"/>
                        </div>
                        <div class="label">Search</div>
                    </div>
                </div>

                <div class="filters">
                    <input type="text" id="searchInput" placeholder="Filter URLs (type to search)..."
                           onkeyup="filterTable()"/>
                    <button class="filter-btn active" onclick="filterType(this,'all')">All</button>
                    <button class="filter-btn" onclick="filterType(this,'home')">Home</button>
                    <button class="filter-btn" onclick="filterType(this,'product')">Product</button>
                    <button class="filter-btn" onclick="filterType(this,'category')">Category</button>
                    <button class="filter-btn" onclick="filterType(this,'article')">Article</button>
                    <button class="filter-btn" onclick="filterType(this,'search')">Search</button>
                </div>

                <div class="count-info">Showing
                    <span id="visibleCount">
                        <xsl:value-of select="count(s:urlset/s:url)"/>
                    </span>
                    URLs
                </div>

                <table id="sitemapTable">
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Type</th>
                            <th>Last Modified</th>
                            <th>Priority</th>
                            <th>Alternates</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        <xsl:for-each select="s:urlset/s:url">
                            <tr class="url-row">
                                <td>
                                    <a class="url-link" target="_blank">
                                        <xsl:attribute name="href">
                                            <xsl:value-of select="s:loc"/>
                                        </xsl:attribute>
                                        <xsl:value-of select="s:loc"/>
                                    </a>
                                </td>
                                <td>
                                    <xsl:variable name="typeVal" select="s:type"/>
                                    <span>
                                        <xsl:attribute name="class">type-badge type-
                                            <xsl:value-of select="$typeVal"/>
                                        </xsl:attribute>
                                        <xsl:value-of select="$typeVal"/>
                                    </span>
                                </td>
                                <td>
                                    <xsl:value-of select="substring(s:lastmod, 1, 10)"/>
                                </td>
                                <td>
                                    <xsl:value-of select="s:priority"/>
                                </td>
                                <td class="alt-list">
                                    <xsl:for-each select="xhtml:link">
                                        <span>
                                            <xsl:value-of select="@hreflang"/>
                                        </span>
                                    </xsl:for-each>
                                </td>
                            </tr>
                        </xsl:for-each>
                    </tbody>
                </table>

                <script>
                    function filterTable() {
                    var input = document.getElementById('searchInput').value.toLowerCase();
                    var rows = document.querySelectorAll('.url-row');
                    var count = 0;
                    rows.forEach(function(row) {
                    var text = row.textContent.toLowerCase();
                    if (text.indexOf(input) > -1) {
                    row.classList.remove('hidden');
                    count++;
                    } else {
                    row.classList.add('hidden');
                    }
                    });
                    document.getElementById('visibleCount').textContent = count;
                    }

                    function filterType(btn, type) {
                    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    var rows = document.querySelectorAll('.url-row');
                    var count = 0;
                    rows.forEach(function(row) {
                    var rowType = row.querySelector('.type-badge').textContent.trim();
                    if (type === 'all' || rowType === type) {
                    row.classList.remove('hidden');
                    count++;
                    } else {
                    row.classList.add('hidden');
                    }
                    });
                    document.getElementById('visibleCount').textContent = count;
                    }
                </script>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
