/// <reference types="node" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, join, dirname } from 'path';
import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
var __dirname = dirname(fileURLToPath(import.meta.url));
var repoRoot = resolve(__dirname, '..');
// ─── Readers ─────────────────────────────────────────────────────────────────
function isDir(p) {
    try {
        return statSync(p).isDirectory();
    }
    catch (_a) {
        return false;
    }
}
function readLevels() {
    var _a;
    var levelsFile = join(repoRoot, 'metadata', 'levels.yaml');
    if (existsSync(levelsFile)) {
        try {
            var data = yaml.load(readFileSync(levelsFile, 'utf-8'));
            return ((_a = data === null || data === void 0 ? void 0 : data.levels) !== null && _a !== void 0 ? _a : []).sort(function (a, b) { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 99) - ((_b = b.order) !== null && _b !== void 0 ? _b : 99); });
        }
        catch ( /* fall back to legacy per-directory metadata */_b) { /* fall back to legacy per-directory metadata */ }
    }
    var theoryDir = join(repoRoot, 'content', 'theory');
    if (!existsSync(theoryDir))
        return [];
    var levels = [];
    for (var _i = 0, _c = readdirSync(theoryDir); _i < _c.length; _i++) {
        var dir = _c[_i];
        if (!isDir(join(theoryDir, dir)))
            continue;
        var metaPath = join(theoryDir, dir, 'meta.yaml');
        if (!existsSync(metaPath))
            continue;
        try {
            var parsed = yaml.load(readFileSync(metaPath, 'utf-8'));
            if (parsed === null || parsed === void 0 ? void 0 : parsed.id)
                levels.push(parsed);
        }
        catch ( /* skip malformed */_d) { /* skip malformed */ }
    }
    return levels.sort(function (a, b) { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 99) - ((_b = b.order) !== null && _b !== void 0 ? _b : 99); });
}
function readProjects() {
    var projectsDir = join(repoRoot, 'content', 'projects');
    if (!existsSync(projectsDir))
        return [];
    var projects = [];
    var scan = function (dir) {
        if (!existsSync(dir))
            return;
        for (var _i = 0, _a = readdirSync(dir); _i < _a.length; _i++) {
            var entry = _a[_i];
            var entryPath = join(dir, entry);
            if (!isDir(entryPath))
                continue;
            var yamlPath = join(entryPath, 'project.yaml');
            if (existsSync(yamlPath)) {
                try {
                    var parsed = yaml.load(readFileSync(yamlPath, 'utf-8'));
                    if (parsed === null || parsed === void 0 ? void 0 : parsed.id) {
                        projects.push(parsed);
                    }
                }
                catch ( /* skip */_b) { /* skip */ }
            }
            else {
                scan(entryPath);
            }
        }
    };
    scan(projectsDir);
    return projects;
}
function readPaths() {
    var _a;
    var pathsFile = join(repoRoot, 'metadata', 'paths.yaml');
    if (!existsSync(pathsFile))
        return [];
    try {
        var data = yaml.load(readFileSync(pathsFile, 'utf-8'));
        return (_a = data === null || data === void 0 ? void 0 : data.paths) !== null && _a !== void 0 ? _a : [];
    }
    catch (_b) {
        return [];
    }
}
// Extracts a title from the first # heading in a markdown string
function extractMdTitle(md, fallback) {
    var match = md.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : fallback;
}
function readMarkdownEntriesDir(base, dirname) {
    var entriesDir = join(base, dirname);
    var entries = [];
    if (!existsSync(entriesDir) || !isDir(entriesDir)) {
        return entries;
    }
    var files = readdirSync(entriesDir)
        .filter(function (file) { return file.endsWith('.md'); })
        .sort(); // lexicographic: 01-, 02-, …
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var file = files_1[_i];
        var body = readFileSync(join(entriesDir, file), 'utf-8');
        var slug = file.replace(/\.md$/, '');
        var title = extractMdTitle(body, slug);
        entries.push({ slug: slug, title: title, body: body });
    }
    return entries;
}
function extractFirstParagraph(md) {
    var blocks = md
        .replace(/^#\s+.+$/m, '')
        .split(/\r?\n\r?\n/)
        .map(function (block) { return block.trim(); })
        .filter(Boolean);
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var block = blocks_1[_i];
        if (block.startsWith('```') || block.startsWith('##')) {
            continue;
        }
        return block.replace(/\r?\n+/g, ' ');
    }
    return '';
}
function extractNamedFence(md, names) {
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        var marker = "```".concat(name_1);
        var start = md.indexOf(marker);
        if (start === -1) {
            continue;
        }
        var content = md.slice(start + marker.length);
        if (content.startsWith('\r\n')) {
            content = content.slice(2);
        }
        else if (content.startsWith('\n')) {
            content = content.slice(1);
        }
        var end = content.indexOf('```');
        if (end === -1) {
            continue;
        }
        return content.slice(0, end).trim();
    }
    return '';
}
function readSimulatorPresetsDir(base, dirname) {
    return readMarkdownEntriesDir(base, dirname)
        .map(function (entry) { return ({
        slug: entry.slug,
        title: entry.title,
        note: extractFirstParagraph(entry.body),
        program: extractNamedFence(entry.body, ['forja-program', 'sim-program', 'program']),
        data: extractNamedFence(entry.body, ['forja-data', 'sim-data', 'data']),
    }); })
        .filter(function (entry) { return entry.program.length > 0; });
}
function readLevelContent(theoryDir) {
    if (!theoryDir) {
        return { readme: '', exercises: '', simulator: '', simulatorPresets: [], exerciseEntries: [], chapters: [] };
    }
    var base = join(repoRoot, theoryDir);
    var readFile = function (name) {
        var p = join(base, name);
        return existsSync(p) ? readFileSync(p, 'utf-8') : '';
    };
    var chapters = readMarkdownEntriesDir(base, 'chapters');
    var exerciseEntries = readMarkdownEntriesDir(base, 'exercises');
    var simulatorPresets = readSimulatorPresetsDir(base, 'simulator-presets');
    return {
        readme: readFile('README.md'),
        exercises: readFile('exercises.md'),
        simulator: readFile('simulador.md'),
        simulatorPresets: simulatorPresets,
        exerciseEntries: exerciseEntries,
        chapters: chapters,
    };
}
// ─── Virtual module plugin ────────────────────────────────────────────────────
var CONTENT_INDEX_ID = 'virtual:forja-content';
var CONTENT_INDEX_RESOLVED_ID = '\0' + CONTENT_INDEX_ID;
var CONTENT_BODY_ID = 'virtual:forja-content-body';
var CONTENT_BODY_RESOLVED_ID = '\0' + CONTENT_BODY_ID;
function readProjectContent(projects) {
    var projectContent = {};
    for (var _i = 0, projects_1 = projects; _i < projects_1.length; _i++) {
        var project = projects_1[_i];
        var readmePath = join(repoRoot, project.dir, 'README.md');
        projectContent[project.id] = {
            readme: existsSync(readmePath) ? readFileSync(readmePath, 'utf-8') : '',
        };
    }
    return projectContent;
}
function readIntroContent() {
    var introSources = {
        forja: join(repoRoot, 'content', 'theory', 'forja.md'),
        workspace: join(repoRoot, 'content', 'theory', 'README.md'),
        theory: join(repoRoot, 'content', 'theory', 'README.md'),
    };
    return Object.fromEntries(Object.entries(introSources).map(function (_a) {
        var id = _a[0], filePath = _a[1];
        return [
            id,
            existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '',
        ];
    }));
}
function forjaContentPlugin() {
    return {
        name: 'forja-content',
        resolveId: function (id) {
            if (id === CONTENT_INDEX_ID)
                return CONTENT_INDEX_RESOLVED_ID;
            if (id === CONTENT_BODY_ID)
                return CONTENT_BODY_RESOLVED_ID;
        },
        load: function (id) {
            var levels = readLevels();
            if (id === CONTENT_INDEX_RESOLVED_ID) {
                var projects = readProjects();
                var paths = readPaths();
                return [
                    "export const levels = ".concat(JSON.stringify(levels), ";"),
                    "export const projects = ".concat(JSON.stringify(projects), ";"),
                    "export const paths = ".concat(JSON.stringify(paths), ";"),
                ].join('\n');
            }
            if (id === CONTENT_BODY_RESOLVED_ID) {
                var projects = readProjects();
                var levelContent = {};
                for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
                    var level = levels_1[_i];
                    if (level.theory_dir) {
                        levelContent[level.id] = readLevelContent(level.theory_dir);
                    }
                }
                var projectContent = readProjectContent(projects);
                var introContent = readIntroContent();
                return [
                    "export const levelContent = ".concat(JSON.stringify(levelContent), ";"),
                    "export const projectContent = ".concat(JSON.stringify(projectContent), ";"),
                    "export const introContent = ".concat(JSON.stringify(introContent), ";"),
                ].join('\n');
            }
        },
        configureServer: function (server) {
            // Watch content/metadata dirs so changes trigger HMR
            var watchDirs = [
                join(repoRoot, 'content'),
                join(repoRoot, 'metadata'),
            ];
            watchDirs.forEach(function (d) { if (existsSync(d))
                server.watcher.add(d); });
            server.watcher.on('change', function (file) {
                if (file.includes('content') || file.includes('metadata')) {
                    for (var _i = 0, _a = [CONTENT_INDEX_RESOLVED_ID, CONTENT_BODY_RESOLVED_ID]; _i < _a.length; _i++) {
                        var id = _a[_i];
                        var mod = server.moduleGraph.getModuleById(id);
                        if (mod)
                            server.moduleGraph.invalidateModule(mod);
                    }
                    server.ws.send({ type: 'full-reload' });
                }
            });
        },
    };
}
// ─── Vite config ──────────────────────────────────────────────────────────────
export default defineConfig({
    plugins: [react(), forjaContentPlugin()],
    resolve: {
        alias: { '@': resolve(__dirname, 'src') },
    },
    build: {
        chunkSizeWarningLimit: 650,
    },
});
