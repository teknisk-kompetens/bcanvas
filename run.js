<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Business Model Canvas</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsPlumb/2.15.6/js/jsplumb.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #3498db;
            --secondary-color: #2ecc71;
            --accent-color: #e74c3c;
            --bg-color: #f9f9f9;
            --text-color: #333;
            --panel-bg: #fff;
            --panel-shadow: 0 2px 10px rgba(0,0,0,0.1);
            --note-shadow: 0 3px 6px rgba(0,0,0,0.16);
            --note-yellow: #fff9c4;
            --note-blue: #bbdefb;
            --note-green: #c8e6c9;
            --note-pink: #f8bbd0;
            --note-purple: #e1bee7;
            --note-orange: #ffe0b2;
        }

        body.dark-mode {
            --primary-color: #2980b9;
            --secondary-color: #27ae60;
            --accent-color: #c0392b;
            --bg-color: #1a1a1a;
            --text-color: #f0f0f0;
            --panel-bg: #2c2c2c;
            --panel-shadow: 0 2px 10px rgba(0,0,0,0.3);
            --note-shadow: 0 3px 6px rgba(0,0,0,0.3);
            --note-yellow: #827717;
            --note-blue: #0d47a1;
            --note-green: #1b5e20;
            --note-pink: #880e4f;
            --note-purple: #4a148c;
            --note-orange: #e65100;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            transition: background-color 0.3s, color 0.3s;
            overflow: hidden;
            height: 100vh;
        }

        #app-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            position: relative;
        }

        #header {
            background-color: var(--panel-bg);
            padding: 15px 20px;
            box-shadow: var(--panel-shadow);
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 100;
        }

        #header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--primary-color);
            margin: 0;
        }

        #canvas-container {
            flex: 1;
            overflow: auto;
            position: relative;
            padding: 20px;
        }

        #business-model-canvas {
            background-color: var(--panel-bg);
            border-radius: 8px;
            box-shadow: var(--panel-shadow);
            display: grid;
            grid-template-columns: 20% 20% 20% 20% 20%;
            grid-template-rows: 50% 50%;
            width: 1200px;
            height: 700px;
            margin: 0 auto;
            position: relative;
            transform-origin: top left;
        }

        .canvas-section {
            border: 1px solid #ddd;
            padding: 10px;
            position: relative;
            overflow: hidden;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--primary-color);
            font-size: 0.9rem;
            text-align: center;
        }

        #key-partners {
            grid-column: 1;
            grid-row: 1 / span 2;
        }

        #key-activities {
            grid-column: 2;
            grid-row: 1;
        }

        #value-propositions {
            grid-column: 3;
            grid-row: 1 / span 2;
        }

        #customer-relationships {
            grid-column: 4;
            grid-row: 1;
        }

        #customer-segments {
            grid-column: 5;
            grid-row: 1 / span 2;
        }

        #key-resources {
            grid-column: 2;
            grid-row: 2;
        }

        #channels {
            grid-column: 4;
            grid-row: 2;
        }

        #cost-structure {
            grid-column: 1 / span 3;
            grid-row: 3;
        }

        #revenue-streams {
            grid-column: 3 / span 3;
            grid-row: 3;
        }

        .sticky-note {
            position: absolute;
            width: 150px;
            min-height: 80px;
            padding: 10px;
            background-color: var(--note-yellow);
            box-shadow: var(--note-shadow);
            border-radius: 2px;
            cursor: move;
            z-index: 10;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
            transform: rotate(var(--rotation, 0deg));
        }

        .sticky-note:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 20;
        }

        .sticky-note.selected {
            box-shadow: 0 0 0 2px var(--primary-color), var(--note-shadow);
            z-index: 30;
        }

        .sticky-note-content {
            width: 100%;
            height: 100%;
            outline: none;
            background: transparent;
            border: none;
            resize: none;
            font-family: inherit;
            font-size: 0.9rem;
            color: inherit;
            overflow: hidden;
        }

        .sticky-note.yellow { background-color: var(--note-yellow); }
        .sticky-note.blue { background-color: var(--note-blue); }
        .sticky-note.green { background-color: var(--note-green); }
        .sticky-note.pink { background-color: var(--note-pink); }
        .sticky-note.purple { background-color: var(--note-purple); }
        .sticky-note.orange { background-color: var(--note-orange); }

        #smart-panel {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--panel-bg);
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
            padding: 10px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 1000;
            transition: transform 0.3s;
        }

        #smart-panel.top {
            top: 0;
            bottom: auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .panel-group {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .panel-button {
            background-color: transparent;
            border: none;
            color: var(--text-color);
            font-size: 1rem;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background-color 0.2s;
        }

        .panel-button:hover {
            background-color: rgba(0,0,0,0.05);
        }

        .panel-button i {
            font-size: 1.2rem;
        }

        .dropdown {
            position: relative;
            display: inline-block;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            bottom: 100%;
            left: 0;
            background-color: var(--panel-bg);
            min-width: 160px;
            box-shadow: var(--panel-shadow);
            border-radius: 4px;
            z-index: 1001;
            padding: 5px 0;
        }

        #smart-panel.top .dropdown-content {
            bottom: auto;
            top: 100%;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }

        .dropdown-item {
            padding: 8px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .dropdown-item:hover {
            background-color: rgba(0,0,0,0.05);
        }

        .color-option {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: inline-block;
        }

        .yellow-option { background-color: var(--note-yellow); }
        .blue-option { background-color: var(--note-blue); }
        .green-option { background-color: var(--note-green); }
        .pink-option { background-color: var(--note-pink); }
        .purple-option { background-color: var(--note-purple); }
        .orange-option { background-color: var(--note-orange); }

        #format-menu {
            position: absolute;
            display: none;
            background-color: var(--panel-bg);
            box-shadow: var(--panel-shadow);
            border-radius: 4px;
            padding: 8px;
            z-index: 1002;
        }

        .format-button {
            background-color: transparent;
            border: none;
            color: var(--text-color);
            font-size: 1rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            transition: background-color 0.2s;
        }

        .format-button:hover {
            background-color: rgba(0,0,0,0.05);
        }

        .format-button.active {
            background-color: rgba(0,0,0,0.1);
            color: var(--primary-color);
        }

        .format-divider {
            width: 1px;
            height: 20px;
            background-color: #ddd;
            margin: 0 5px;
            display: inline-block;
        }

        #zoom-controls {
            position: absolute;
            bottom: 80px;
            right: 20px;
            background-color: var(--panel-bg);
            box-shadow: var(--panel-shadow);
            border-radius: 4px;
            padding: 5px;
            display: flex;
            flex-direction: column;
            z-index: 999;
        }

        .zoom-button {
            background-color: transparent;
            border: none;
            color: var(--text-color);
            font-size: 1.2rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            transition: background-color 0.2s;
        }

        .zoom-button:hover {
            background-color: rgba(0,0,0,0.05);
        }

        #zoom-level {
            text-align: center;
            font-size: 0.8rem;
            margin: 5px 0;
        }

        #hamburger-menu {
            position: absolute;
            top: 80px;
            right: 20px;
            background-color: var(--panel-bg);
            box-shadow: var(--panel-shadow);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 999;
            transition: transform 0.3s, background-color 0.2s;
        }

        #hamburger-menu:hover {
            background-color: rgba(0,0,0,0.05);
        }

        #hamburger-menu.open {
            transform: rotate(90deg);
        }

        #menu-panel {
            position: absolute;
            top: 80px;
            right: 80px;
            background-color: var(--panel-bg);
            box-shadow: var(--panel-shadow);
            border-radius: 4px;
            padding: 10px;
            width: 200px;
            display: none;
            z-index: 998;
        }

        .menu-item {
            padding: 10px;
            cursor: pointer;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            gap: 10px;
            border-radius: 4px;
        }

        .menu-item:hover {
            background-color: rgba(0,0,0,0.05);
        }

        .menu-item i {
            width: 20px;
            text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
            #business-model-canvas {
                width: 1000px;
                height: 600px;
            }
        }

        @media (max-width: 992px) {
            #business-model-canvas {
                width: 800px;
                height: 500px;
            }
            .sticky-note {
                width: 120px;
                min-height: 70px;
                font-size: 0.8rem;
            }
        }

        /* Connection lines styling */
        .jtk-connector {
            z-index: 5;
        }

        .jtk-endpoint {
            z-index: 6;
        }

        /* Loading overlay */
        #loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            color: white;
            font-size: 1.5rem;
        }

        .spinner {
            border: 5px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 5px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-right: 15px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div id="app-container">
        <div id="header">
            <h1>Business Model Canvas</h1>
            <div class="panel-group">
                <button id="toggle-panel-position" class="panel-button" title="Toggle Panel Position">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button id="toggle-dark-mode" class="panel-button" title="Toggle Dark Mode">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
        </div>

        <div id="canvas-container">
            <div id="business-model-canvas">
                <div id="key-partners" class="canvas-section">
                    <div class="section-title">Nyckelpartners</div>
                </div>
                <div id="key-activities" class="canvas-section">
                    <div class="section-title">Nyckelaktiviteter</div>
                </div>
                <div id="value-propositions" class="canvas-section">
                    <div class="section-title">Värdeerbjudande</div>
                </div>
                <div id="customer-relationships" class="canvas-section">
                    <div class="section-title">Kundrelation</div>
                </div>
                <div id="customer-segments" class="canvas-section">
                    <div class="section-title">Kundsegment</div>
                </div>
                <div id="key-resources" class="canvas-section">
                    <div class="section-title">Nyckelresurser</div>
                </div>
                <div id="channels" class="canvas-section">
                    <div class="section-title">Kanaler</div>
                </div>
                <div id="cost-structure" class="canvas-section">
                    <div class="section-title">Kostnadsstruktur</div>
                </div>
                <div id="revenue-streams" class="canvas-section">
                    <div class="section-title">Intäktsflöden</div>
                </div>
            </div>
        </div>

        <div id="smart-panel">
            <div class="panel-group">
                <div class="dropdown">
                    <button class="panel-button" title="Add Note">
                        <i class="fas fa-plus"></i> Lägg till
                    </button>
                    <div class="dropdown-content">
                        <div class="dropdown-item" data-color="yellow">
                            <span class="color-option yellow-option"></span> Gul lapp
                        </div>
                        <div class="dropdown-item" data-color="blue">
                            <span class="color-option blue-option"></span> Blå lapp
                        </div>
                        <div class="dropdown-item" data-color="green">
                            <span class="color-option green-option"></span> Grön lapp
                        </div>
                        <div class="dropdown-item" data-color="pink">
                            <span class="color-option pink-option"></span> Rosa lapp
                        </div>
                        <div class="dropdown-item" data-color="purple">
                            <span class="color-option purple-option"></span> Lila lapp
                        </div>
                        <div class="dropdown-item" data-color="orange">
                            <span class="color-option orange-option"></span> Orange lapp
                        </div>
                    </div>
                </div>

                <button id="connect-notes-btn" class="panel-button" title="Connect Notes">
                    <i class="fas fa-link"></i> Koppla
                </button>

                <button id="clear-connections-btn" class="panel-button" title="Clear Connections">
                    <i class="fas fa-unlink"></i> Rensa kopplingar
                </button>
            </div>

            <div class="panel-group">
                <button id="load-template-btn" class="panel-button" title="Load Template">
                    <i class="fas fa-file-import"></i> Ladda mall
                </button>
                <button id="save-btn" class="panel-button" title="Save Canvas">
                    <i class="fas fa-save"></i> Spara
                </button>
                <button id="load-btn" class="panel-button" title="Load Canvas">
                    <i class="fas fa-folder-open"></i> Öppna
                </button>
                <button id="export-btn" class="panel-button" title="Export as Image">
                    <i class="fas fa-file-export"></i> Exportera
                </button>
            </div>
        </div>

        <div id="format-menu">
            <button class="format-button" data-format="bold" title="Bold">
                <i class="fas fa-bold"></i>
            </button>
            <button class="format-button" data-format="italic" title="Italic">
                <i class="fas fa-italic"></i>
            </button>
            <button class="format-button" data-format="underline" title="Underline">
                <i class="fas fa-underline"></i>
            </button>
            <span class="format-divider"></span>
            <button class="format-button" data-format="alignLeft" title="Align Left">
                <i class="fas fa-align-left"></i>
            </button>
            <button class="format-button" data-format="alignCenter" title="Align Center">
                <i class="fas fa-align-center"></i>
            </button>
            <button class="format-button" data-format="alignRight" title="Align Right">
                <i class="fas fa-align-right"></i>
            </button>
            <span class="format-divider"></span>
            <div class="dropdown">
                <button class="format-button" title="Note Color">
                    <i class="fas fa-palette"></i>
                </button>
                <div class="dropdown-content">
                    <div class="dropdown-item" data-note-color="yellow">
                        <span class="color-option yellow-option"></span> Gul
                    </div>
                    <div class="dropdown-item" data-note-color="blue">
                        <span class="color-option blue-option"></span> Blå
                    </div>
                    <div class="dropdown-item" data-note-color="green">
                        <span class="color-option green-option"></span> Grön
                    </div>
                    <div class="dropdown-item" data-note-color="pink">
                        <span class="color-option pink-option"></span> Rosa
                    </div>
                    <div class="dropdown-item" data-note-color="purple">
                        <span class="color-option purple-option"></span> Lila
                    </div>
                    <div class="dropdown-item" data-note-color="orange">
                        <span class="color-option orange-option"></span> Orange
                    </div>
                </div>
            </div>
            <button class="format-button" data-format="rotate" title="Rotate Note">
                <i class="fas fa-redo"></i>
            </button>
            <button class="format-button" data-format="delete" title="Delete Note">
                <i class="fas fa-trash"></i>
            </button>
        </div>

        <div id="zoom-controls">
            <button id="zoom-in" class="zoom-button" title="Zoom In">
                <i class="fas fa-plus"></i>
            </button>
            <div id="zoom-level">100%</div>
            <button id="zoom-out" class="zoom-button" title="Zoom Out">
                <i class="fas fa-minus"></i>
            </button>
            <button id="zoom-reset" class="zoom-button" title="Reset Zoom">
                <i class="fas fa-sync-alt"></i>
            </button>
        </div>

        <div id="hamburger-menu">
            <i class="fas fa-bars"></i>
        </div>

        <div id="menu-panel">
            <div class="menu-item" id="menu-clear-all">
                <i class="fas fa-trash-alt"></i> Rensa allt
            </div>
            <div class="menu-item" id="menu-help">
                <i class="fas fa-question-circle"></i> Hjälp
            </div>
            <div class="menu-item" id="menu-about">
                <i class="fas fa-info-circle"></i> Om
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize variables
            let currentZoom = 1;
            let isDragging = false;
            let selectedNotes = [];
            let isConnectingMode = false;
            let jsPlumbInstance;
            let noteIdCounter = 0;
            let canvasState = {
                notes: [],
                connections: []
            };

            // Initialize jsPlumb
            jsPlumbInstance = jsPlumb.getInstance({
                Endpoint: ["Dot", { radius: 2 }],
                Connector: ["Bezier", { curviness: 50 }],
                PaintStyle: { stroke: "#2980b9", strokeWidth: 2 },
                HoverPaintStyle: { stroke: "#e74c3c", strokeWidth: 3 },
                ConnectionOverlays: [
                    ["Arrow", { 
                        location: 1,
                        id: "arrow",
                        length: 10,
                        width: 10
                    }]
                ],
                Container: "business-model-canvas"
            });

            // DOM elements
            const canvas = document.getElementById('business-model-canvas');
            const canvasContainer = document.getElementById('canvas-container');
            const smartPanel = document.getElementById('smart-panel');
            const formatMenu = document.getElementById('format-menu');
            const hamburgerMenu = document.getElementById('hamburger-menu');
            const menuPanel = document.getElementById('menu-panel');
            
            // Initialize event listeners
            initEventListeners();
            
            // Load saved state if available
            loadCanvasState();

            // Function to create a new sticky note
            function createStickyNote(color = 'yellow', text = '', left = 50, top = 50, rotation = 0, id = null) {
                const noteId = id || 'note-' + noteIdCounter++;
                const note = document.createElement('div');
                note.className = `sticky-note ${color}`;
                note.id = noteId;
                note.style.left = left + 'px';
                note.style.top = top + 'px';
                note.style.setProperty('--rotation', rotation + 'deg');
                
                const content = document.createElement('div');
                content.className = 'sticky-note-content';
                content.contentEditable = true;
                content.innerHTML = text;
                
                note.appendChild(content);
                canvas.appendChild(note);
                
                // Make the note draggable
                makeDraggable(note);
                
                // Make it a jsPlumb source and target
                jsPlumbInstance.makeSource(note, {
                    filter: ".sticky-note-content",
                    anchor: "Continuous",
                    connectorStyle: { stroke: "#2980b9", strokeWidth: 2 },
                    connectionType: "basic"
                });
                
                jsPlumbInstance.makeTarget(note, {
                    dropOptions: { hoverClass: "dragHover" },
                    anchor: "Continuous"
                });
                
                return note;
            }

            // Make an element draggable
            function makeDraggable(element) {
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
                
                element.onmousedown = dragMouseDown;
                
                function dragMouseDown(e) {
                    if (isConnectingMode) return;
                    
                    e = e || window.event;
                    e.preventDefault();
                    
                    // Get the mouse cursor position at startup
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    
                    // Bring the note to the front
                    element.style.zIndex = 30;
                    
                    // Add selected class
                    if (!e.ctrlKey) {
                        // Deselect all notes if ctrl is not pressed
                        document.querySelectorAll('.sticky-note.selected').forEach(note => {
                            if (note !== element) note.classList.remove('selected');
                        });
                        selectedNotes = [];
                    }
                    
                    element.classList.add('selected');
                    if (!selectedNotes.includes(element)) {
                        selectedNotes.push(element);
                    }
                    
                    // Show format menu
                    showFormatMenu(e.clientX, e.clientY);
                    
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    
                    isDragging = false;
                }
                
                function elementDrag(e) {
                    e = e || window.event;
                    e.preventDefault();
                    
                    // Calculate the new cursor position
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    
                    isDragging = true;
                    
                    // Move all selected notes
                    selectedNotes.forEach(note => {
                        // Set the element's new position
                        note.style.top = (note.offsetTop - pos2) + "px";
                        note.style.left = (note.offsetLeft - pos1) + "px";
                    });
                    
                    // Repaint connections
                    jsPlumbInstance.repaintEverything();
                }
                
                function closeDragElement() {
                    // Stop moving when mouse button is released
                    document.onmouseup = null;
                    document.onmousemove = null;
                    
                    // If it was a click (not a drag), handle click event
                    if (!isDragging) {
                        // Focus on the content
                        const content = element.querySelector('.sticky-note-content');
                        if (content) {
                            content.focus();
                        }
                    }
                    
                    // Save the canvas state
                    saveCanvasState();
                }
            }

            // Show format menu at the specified position
            function showFormatMenu(x, y) {
                formatMenu.style.display = 'block';
                
                // Position the menu
                const menuWidth = formatMenu.offsetWidth;
                const menuHeight = formatMenu.offsetHeight;
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                
                // Ensure the menu stays within the viewport
                let menuX = x;
                let menuY = y - menuHeight - 10;
                
                if (menuX + menuWidth > windowWidth) {
                    menuX = windowWidth - menuWidth - 10;
                }
                
                if (menuY < 0) {
                    menuY = y + 10;
                }
                
                formatMenu.style.left = menuX + 'px';
                formatMenu.style.top = menuY + 'px';
            }

            // Hide format menu
            function hideFormatMenu() {
                formatMenu.style.display = 'none';
            }

            // Apply formatting to selected notes
            function applyFormatting(format) {
                selectedNotes.forEach(note => {
                    const content = note.querySelector('.sticky-note-content');
                    
                    switch (format) {
                        case 'bold':
                            document.execCommand('bold', false, null);
                            break;
                        case 'italic':
                            document.execCommand('italic', false, null);
                            break;
                        case 'underline':
                            document.execCommand('underline', false, null);
                            break;
                        case 'alignLeft':
                            document.execCommand('justifyLeft', false, null);
                            break;
                        case 'alignCenter':
                            document.execCommand('justifyCenter', false, null);
                            break;
                        case 'alignRight':
                            document.execCommand('justifyRight', false, null);
                            break;
                        case 'rotate':
                            const currentRotation = parseInt(getComputedStyle(note).getPropertyValue('--rotation')) || 0;
                            note.style.setProperty('--rotation', (currentRotation + 5) + 'deg');
                            break;
                        case 'delete':
                            // Remove all connections
                            jsPlumbInstance.removeAllEndpoints(note);
                            // Remove the note
                            note.remove();
                            // Remove from selected notes
                            selectedNotes = selectedNotes.filter(n => n !== note);
                            break;
                    }
                });
                
                // Save the canvas state
                saveCanvasState();
            }

            // Change note color
            function changeNoteColor(color) {
                selectedNotes.forEach(note => {
                    // Remove all color classes
                    note.classList.remove('yellow', 'blue', 'green', 'pink', 'purple', 'orange');
                    // Add the selected color class
                    note.classList.add(color);
                });
                
                // Save the canvas state
                saveCanvasState();
            }

            // Toggle connecting mode
            function toggleConnectingMode() {
                isConnectingMode = !isConnectingMode;
                
                if (isConnectingMode) {
                    document.getElementById('connect-notes-btn').classList.add('active');
                    // Change cursor to indicate connecting mode
                    document.body.style.cursor = 'crosshair';
                } else {
                    document.getElementById('connect-notes-btn').classList.remove('active');
                    document.body.style.cursor = 'default';
                }
            }

            // Clear all connections
            function clearConnections() {
                jsPlumbInstance.deleteEveryConnection();
                saveCanvasState();
            }

            // Save canvas state
            function saveCanvasState() {
                const notes = [];
                document.querySelectorAll('.sticky-note').forEach(note => {
                    notes.push({
                        id: note.id,
                        color: Array.from(note.classList).find(cls => ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'].includes(cls)),
                        text: note.querySelector('.sticky-note-content').innerHTML,
                        left: parseInt(note.style.left),
                        top: parseInt(note.style.top),
                        rotation: parseInt(getComputedStyle(note).getPropertyValue('--rotation')) || 0
                    });
                });
                
                const connections = [];
                jsPlumbInstance.getConnections().forEach(conn => {
                    connections.push({
                        sourceId: conn.sourceId,
                        targetId: conn.targetId
                    });
                });
                
                canvasState = { notes, connections };
                localStorage.setItem('businessModelCanvasState', JSON.stringify(canvasState));
            }

            // Load canvas state
            function loadCanvasState() {
                const savedState = localStorage.getItem('businessModelCanvasState');
                if (savedState) {
                    try {
                        canvasState = JSON.parse(savedState);
                        
                        // Clear current canvas
                        document.querySelectorAll('.sticky-note').forEach(note => note.remove());
                        jsPlumbInstance.deleteEveryConnection();
                        
                        // Create notes
                        canvasState.notes.forEach(note => {
                            createStickyNote(note.color, note.text, note.left, note.top, note.rotation, note.id);
                        });
                        
                        // Create connections
                        setTimeout(() => {
                            canvasState.connections.forEach(conn => {
                                jsPlumbInstance.connect({
                                    source: document.getElementById(conn.sourceId),
                                    target: document.getElementById(conn.targetId)
                                });
                            });
                        }, 100);
                    } catch (error) {
                        console.error('Error loading canvas state:', error);
                    }
                }
            }

            // Load template
            function loadTemplate() {
                // Clear current canvas
                document.querySelectorAll('.sticky-note').forEach(note => note.remove());
                jsPlumbInstance.deleteEveryConnection();
                
                // Template data based on the image
                const template = [
                    { section: 'key-partners', color: 'yellow', text: 'Marknads-<br>varierande', left: 50, top: 50 },
                    { section: 'key-activities', color: 'yellow', text: 'Enkla,<br>sunda middagar', left: 50, top: 50 },
                    { section: 'value-propositions', color: 'green', text: 'Kom i Form', left: 50, top: 50 },
                    { section: 'customer-relationships', color: 'blue', text: 'Klubb Lina', left: 50, top: 50 },
                    { section: 'customer-segments', color: 'pink', text: 'Aktiva', left: 50, top: 50 },
                    { section: 'key-resources', color: 'yellow', text: 'linasmatkasse.se', left: 50, top: 50 },
                    { section: 'channels', color: 'blue', text: 'Grön fräsch meny', left: 50, top: 50 },
                    { section: 'customer-segments', color: 'pink', text: 'Vegetarianer', left: 50, top: 120 },
                    { section: 'cost-structure', color: 'orange', text: 'Packning och distribution', left: 50, top: 50 }
                ];
                
                // Create notes in each section
                template.forEach(item => {
                    const section = document.getElementById(item.section);
                    const sectionRect = section.getBoundingClientRect();
                    const canvasRect = canvas.getBoundingClientRect();
                    
                    const left = item.left + (sectionRect.left - canvasRect.left);
                    const top = item.top + (sectionRect.top - canvasRect.top);
                    
                    createStickyNote(item.color, item.text, left, top, Math.random() * 6 - 3);
                });
                
                // Create some connections
                setTimeout(() => {
                    const notes = document.querySelectorAll('.sticky-note');
                    if (notes.length >= 3) {
                        jsPlumbInstance.connect({
                            source: notes[2], // Value proposition
                            target: notes[3]  // Customer relationship
                        });
                        
                        jsPlumbInstance.connect({
                            source: notes[2], // Value proposition
                            target: notes[6]  // Channels
                        });
                    }
                    
                    saveCanvasState();
                }, 100);
            }

            // Export canvas as image
            function exportCanvas() {
                // Show loading overlay
                const loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'loading-overlay';
                loadingOverlay.innerHTML = '<div class="spinner"></div> Exporterar...';
                document.body.appendChild(loadingOverlay);
                
                // Hide format menu and other UI elements temporarily
                formatMenu.style.display = 'none';
                document.getElementById('zoom-controls').style.display = 'none';
                document.getElementById('hamburger-menu').style.display = 'none';
                
                // Use html2canvas to capture the canvas
                setTimeout(() => {
                    html2canvas(canvas, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: getComputedStyle(canvas).backgroundColor
                    }).then(function(canvas) {
                        // Create download link
                        const link = document.createElement('a');
                        link.download = 'business-model-canvas.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                        
                        // Show UI elements again
                        document.getElementById('zoom-controls').style.display = 'flex';
                        document.getElementById('hamburger-menu').style.display = 'flex';
                        
                        // Remove loading overlay
                        loadingOverlay.remove();
                    });
                }, 500);
            }

            // Initialize event listeners
            function initEventListeners() {
                // Canvas click event
                canvas.addEventListener('click', function(e) {
                    if (e.target === canvas || e.target.classList.contains('canvas-section') || e.target.classList.contains('section-title')) {
                        // Deselect all notes
                        document.querySelectorAll('.sticky-note.selected').forEach(note => {
                            note.classList.remove('selected');
                        });
                        selectedNotes = [];
                        
                        // Hide format menu
                        hideFormatMenu();
                    }
                });
                
                // Document click event
                document.addEventListener('click', function(e) {
                    // Hide format menu if clicking outside
                    if (!e.target.closest('#format-menu') && !e.target.closest('.sticky-note')) {
                        hideFormatMenu();
                    }
                    
                    // Hide menu panel if clicking outside
                    if (!e.target.closest('#menu-panel') && !e.target.closest('#hamburger-menu')) {
                        menuPanel.style.display = 'none';
                        hamburgerMenu.classList.remove('open');
                    }
                });
                
                // Format menu buttons
                document.querySelectorAll('.format-button').forEach(button => {
                    button.addEventListener('click', function(e) {
                        const format = this.getAttribute('data-format');
                        if (format) {
                            applyFormatting(format);
                        }
                    });
                });
                
                // Note color options
                document.querySelectorAll('[data-note-color]').forEach(option => {
                    option.addEventListener('click', function() {
                        const color = this.getAttribute('data-note-color');
                        changeNoteColor(color);
                    });
                });
                
                // Add note dropdown items
                document.querySelectorAll('.dropdown-item[data-color]').forEach(item => {
                    item.addEventListener('click', function() {
                        const color = this.getAttribute('data-color');
                        const canvasRect = canvas.getBoundingClientRect();
                        
                        // Create note in the center of the visible canvas
                        const left = (canvasContainer.scrollLeft + canvasContainer.clientWidth / 2 - canvasRect.left);
                        const top = (canvasContainer.scrollTop + canvasContainer.clientHeight / 2 - canvasRect.top);
                        
                        createStickyNote(color, '', left, top, Math.random() * 6 - 3);
                        saveCanvasState();
                    });
                });
                
                // Connect notes button
                document.getElementById('connect-notes-btn').addEventListener('click', toggleConnectingMode);
                
                // Clear connections button
                document.getElementById('clear-connections-btn').addEventListener('click', clearConnections);
                
                // Load template button
                document.getElementById('load-template-btn').addEventListener('click', loadTemplate);
                
                // Save button
                document.getElementById('save-btn').addEventListener('click', function() {
                    saveCanvasState();
                    alert('Canvas sparad!');
                });
                
                // Load button
                document.getElementById('load-btn').addEventListener('click', loadCanvasState);
                
                // Export button
                document.getElementById('export-btn').addEventListener('click', exportCanvas);
                
                // Toggle panel position button
                document.getElementById('toggle-panel-position').addEventListener('click', function() {
                    smartPanel.classList.toggle('top');
                });
                
                // Toggle dark mode button
                document.getElementById('toggle-dark-mode').addEventListener('click', function() {
                    document.body.classList.toggle('dark-mode');
                    
                    // Update icon
                    const icon = this.querySelector('i');
                    if (document.body.classList.contains('dark-mode')) {
                        icon.classList.remove('fa-moon');
                        icon.classList.add('fa-sun');
                    } else {
                        icon.classList.remove('fa-sun');
                        icon.classList.add('fa-moon');
                    }
                });
                
                // Zoom controls
                document.getElementById('zoom-in').addEventListener('click', function() {
                    currentZoom += 0.1;
                    updateZoom();
                });
                
                document.getElementById('zoom-out').addEventListener('click', function() {
                    currentZoom = Math.max(0.3, currentZoom - 0.1);
                    updateZoom();
                });
                
                document.getElementById('zoom-reset').addEventListener('click', function() {
                    currentZoom = 1;
                    updateZoom();
                });
                
                // Hamburger menu
                hamburgerMenu.addEventListener('click', function() {
                    this.classList.toggle('open');
                    menuPanel.style.display = menuPanel.style.display === 'block' ? 'none' : 'block';
                });
                
                // Menu items
                document.getElementById('menu-clear-all').addEventListener('click', function() {
                    if (confirm('Är du säker på att du vill rensa allt?')) {
                        document.querySelectorAll('.sticky-note').forEach(note => note.remove());
                        jsPlumbInstance.deleteEveryConnection();
                        saveCanvasState();
                    }
                });
                
                document.getElementById('menu-help').addEventListener('click', function() {
                    alert('Hjälp för Business Model Canvas:\n\n' +
                          '- Lägg till lappar genom att klicka på "Lägg till"\n' +
                          '- Dra lappar för att flytta dem\n' +
                          '- Klicka på en lapp för att redigera texten\n' +
                          '- Använd formateringsmenyn för att ändra utseende\n' +
                          '- Koppla lappar genom att klicka på "Koppla" och sedan dra från en lapp till en annan\n' +
                          '- Spara och ladda din canvas med knapparna i panelen\n' +
                          '- Exportera som bild med "Exportera"');
                });
                
                document.getElementById('menu-about').addEventListener('click', function() {
                    alert('Modern Business Model Canvas\n\n' +
                          'Ett verktyg för att skapa och visualisera affärsmodeller.\n\n' +
                          'Utvecklad för att hjälpa entreprenörer och företag att strukturera sina idéer.');
                });
                
                // Keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    // Delete selected notes with Delete key
                    if (e.key === 'Delete' && selectedNotes.length > 0) {
                        applyFormatting('delete');
                    }
                    
                    // Save with Ctrl+S
                    if (e.ctrlKey && e.key === 's') {
                        e.preventDefault();
                        saveCanvasState();
                        alert('Canvas sparad!');
                    }
                });
            }

            // Update zoom level
            function updateZoom() {
                canvas.style.transform = `scale(${currentZoom})`;
                document.getElementById('zoom-level').textContent = Math.round(currentZoom * 100) + '%';
                
                // Repaint connections
                jsPlumbInstance.setZoom(currentZoom);
                jsPlumbInstance.repaintEverything();
            }

            // Initialize jsPlumb when the DOM is fully loaded
            jsPlumb.ready(function() {
                // Initialize jsPlumb connections
                jsPlumbInstance.bind("connection", function(info) {
                    saveCanvasState();
                });
            });
        });
    </script>
</body>
</html>
