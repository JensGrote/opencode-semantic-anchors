<%
    // execute externalized script to get the menu
    new GroovyShell(getClass().getClassLoader(),
        new Binding([
            published_content: published_content,
            content: content,
            config: config
        ])
    ).evaluate(
        new File(config.sourceFolder,"groovy/menu.groovy").text
    )

    // ---------- Bilingual Title ----------
    def srcUriTitle = content.sourceuri ?: ''
    def siteTitle = ''
    if (srcUriTitle.startsWith('de/')) {
        siteTitle = 'Opencode Plugin - Semantic Anchors Dokumentation'
    } else if (srcUriTitle.startsWith('en/')) {
        siteTitle = 'Opencode Plugin - Semantic Anchors Documentation'
    } else {
        siteTitle = config.site_title
    }
%>
<nav class="js-navbar-scroll navbar navbar-expand navbar-dark flex-column flex-md-row td-navbar">
    <a class="navbar-brand" href="${content.rootpath}index.html">
        <span class="navbar-logo"><img src="${content.rootpath}images/doctoolchain-logo-blue.png" alt="docToolchain" width="32px" /></span><span
            class="font-weight-bold">${siteTitle}</span>
    </a>
    <div class="td-navbar-nav-scroll ml-md-auto" id="main_navbar">
        <ul class="navbar-nav mt-2 mt-lg-0">
    <li class="nav-item mr-4 mb-2 mb-lg-0"><!--img src="${content.rootpath}images/status.png" alt="status" width="16" height="16" onerror="this.style.display='none'"--></li>
<%
        content.newEntries.each { entry ->
%>
            <li class="nav-item mr-4 mb-2 mb-lg-0">
                <a class="nav-link ${entry.isActive}" href="${entry.href}"><span>${entry.title}</span></a>
            </li>
<%
        }
%>
        </ul>
    </div>
    <div class="navbar-nav d-none d-lg-block" >
    <% if (config.site_search) { 
        if (config.site_search instanceof String) {
            out << config.site_search
        } else {
            out << config.site_search.join(",")
        }
    } else { %>
        <form action="${content.rootpath}search.html">
        <input aria-label="Search this site…" autocomplete="off" class="form-control td-search-input"
               placeholder=" Search this site…" type="search" name="q">
        </form>
    <% } %>
    </div>
    <%
        // ---------- Language Switcher ----------
        def srcUri = content.sourceuri ?: ''
        def currentLang = ''
        def otherLang = ''
        def otherFlag = ''
        def otherTitle = ''
        def otherUri = ''

        if (srcUri.startsWith('en/')) {
            currentLang = 'en'
            otherLang = 'de'
            otherFlag = '🇩🇪'
            otherTitle = 'Deutsch'
            otherUri = content.rootpath + srcUri.replaceFirst('en/', 'de/')
        } else if (srcUri.startsWith('de/')) {
            currentLang = 'de'
            otherLang = 'en'
            otherFlag = '🇬🇧'
            otherTitle = 'English'
            otherUri = content.rootpath + srcUri.replaceFirst('de/', 'en/')
        } else {
            // Landing page or unknown — show both flags
        }
    %>
    <% if (otherUri) { %>
    <ul class="navbar-nav">
        <li class="nav-item ml-2">
            <a class="nav-link" href="${otherUri}" title="${otherTitle}">${otherFlag}</a>
        </li>
    </ul>
    <% } else { %>
    <ul class="navbar-nav">
        <li class="nav-item ml-2">
            <a class="nav-link" href="${content.rootpath}en/index.html" title="English">🇬🇧</a>
        </li>
        <li class="nav-item ml-1">
            <a class="nav-link" href="${content.rootpath}de/index.html" title="Deutsch">🇩🇪</a>
        </li>
    </ul>
    <% } %>
</nav>
