// Dynamiskt ladda html2canvas och eventuella andra bibliotek
(function() {
  const loadDependencies = () => {
    return new Promise((resolve) => {
      // Ladda html2canvas för exportering
      if (typeof html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = () => resolve();
        document.body.appendChild(script);
      } else {
        resolve();
      }
    });
  };

  loadDependencies().then(() => {
    createBusinessModelCanvas();
  });

  function createBusinessModelCanvas() {
    // Kontrollera om det finns sparat tillstånd
    let savedState = localStorage.getItem('businessModelCanvas');
    let initialState = null;
    
    if (savedState) {
      try {
        initialState = JSON.parse(savedState);
      } catch (e) {
        console.error("Kunde inte ladda sparat tillstånd:", e);
        initialState = null;
      }
    }

    // Ta bort eventuell tidigare canvas
    const existingCanvas = document.getElementById('bmc-container');
    if (existingCanvas) existingCanvas.remove();

    // Globala variabler för canvas
    let gridSize = 10;
    let isFullscreen = false;
    let canvasScale = 1;
    let selectedElements = [];
    let isDarkMode = false;
    let relationLines = [];

    // Skapa huvudcontainern
    const container = document.createElement('div');
    container.id = 'bmc-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.backgroundColor = '#f5f5f5';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.overflow = 'auto';
    container.style.transition = 'background-color 0.3s ease';
    document.body.appendChild(container);

    // Inre container för canvas som kan skalas
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'bmc-canvas';
    canvasContainer.style.width = '1200px';
    canvasContainer.style.height = '800px';
    canvasContainer.style.margin = '20px auto';
    canvasContainer.style.position = 'relative';
    canvasContainer.style.backgroundColor = '#ffffff';
    canvasContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    canvasContainer.style.transformOrigin = 'center top';
    canvasContainer.style.transition = 'transform 0.2s ease, background-color 0.3s ease';
    container.appendChild(canvasContainer);

    // Övervakare för skärmstorlek för responsivitet
    const resizeObserver = new ResizeObserver(() => {
      adjustCanvasSize();
    });
    resizeObserver.observe(container);

    // Funktion för att justera canvas-storlek baserat på skärmstorlek
    function adjustCanvasSize() {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Beräkna maximal skala som passar på skärmen
      const scaleX = (containerWidth - 40) / 1200;
      const scaleY = (containerHeight - 40) / 800;
      const maxScale = Math.min(scaleX, scaleY, 1); // Max 1 för att inte förstora över originalstorlek
      
      if (canvasScale > maxScale) {
        canvasScale = maxScale;
      }
      
      canvasContainer.style.transform = `scale(${canvasScale})`;
    }

    // Skapa rutnät för positionering
    const grid = document.createElement('div');
    grid.id = 'grid-layout';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    grid.style.gridTemplateRows = 'auto repeat(3, 1fr)';
    grid.style.height = '100%';
    grid.style.width = '100%';
    grid.style.position = 'absolute';
    grid.style.top = '0';
    grid.style.left = '0';
    canvasContainer.appendChild(grid);

    // Header med företagsnamn och titel
    const header = document.createElement('div');
    header.style.gridColumn = '1 / span 5';
    header.style.display = 'flex';
    header.style.justifyContent = 'center';
    header.style.alignItems = 'center';
    header.style.padding = '20px';
    header.style.position = 'relative';
    header.style.borderBottom = '1px solid #eee';
    header.style.backgroundColor = '#fff';
    header.style.transition = 'background-color 0.3s ease';
    grid.appendChild(header);

    // Affärsmodell-titel (formaterbar)
    const title = document.createElement('div');
    title.id = 'canvas-title';
    title.innerHTML = '<h1 style="color: #000; font-size: 36px; font-weight: normal; margin: 0 50px;">Affärsmodell</h1>';
    title.contentEditable = 'true';
    title.style.cursor = 'pointer';
    title.style.minWidth = '200px';
    title.style.textAlign = 'center';
    
    // Lägg till formatering för titel
    title.addEventListener('click', (e) => {
      e.stopPropagation();
      showFormattingToolbar(title);
    });
    
    header.appendChild(title);

    // Logotyp-container (som kan innehålla uppladdad logotyp)
    const logoContainer = document.createElement('div');
    logoContainer.id = 'logo-container';
    logoContainer.style.position = 'absolute';
    logoContainer.style.right = '20px';
    logoContainer.style.top = '20px';
    logoContainer.style.width = '150px';
    logoContainer.style.height = '60px';
    logoContainer.style.cursor = 'pointer';
    logoContainer.style.display = 'flex';
    logoContainer.style.alignItems = 'center';
    logoContainer.style.justifyContent = 'center';
    logoContainer.style.border = '2px dashed #ccc';
    logoContainer.style.borderRadius = '5px';
    logoContainer.innerHTML = '<div style="text-align: center;">Klicka för att<br>ladda upp logotyp</div>';
    
    // Gör logotyp-container flyttbar
    makeElementDraggable(logoContainer);
    
    // Funktionalitet för att ladda upp logotyp
    logoContainer.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            
            // Rensa container och lägg till bild
            logoContainer.innerHTML = '';
            logoContainer.appendChild(img);
            logoContainer.style.border = 'none';
            
            // Uppdatera storlek baserat på bildinnehåll
            logoContainer.style.width = 'auto';
            logoContainer.style.height = 'auto';
            logoContainer.style.maxWidth = '200px';
            logoContainer.style.maxHeight = '80px';
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    });
    
    canvasContainer.appendChild(logoContainer);

    // Definiera sektioner
    const sectionsData = [
      { id: 'partners', title: 'Nyckelpartners', gridArea: '2 / 1 / 3 / 2', notes: [] },
      { id: 'activities', title: 'Nyckelaktiviteter', gridArea: '2 / 2 / 3 / 3', notes: [] },
      { id: 'proposition', title: 'Värdeerbjudande', gridArea: '2 / 3 / 4 / 4', notes: [] },
      { id: 'relationship', title: 'Kundrelation', gridArea: '2 / 4 / 3 / 5', notes: [] },
      { id: 'customer', title: 'Kundsegment', gridArea: '2 / 5 / 4 / 6', notes: [] },
      { id: 'resources', title: 'Nyckelresurser', gridArea: '3 / 1 / 4 / 2', notes: [] },
      { id: 'channels', title: 'Kanaler', gridArea: '3 / 4 / 4 / 5', notes: [] },
      { id: 'costs', title: 'Kostnadsstruktur', gridArea: '4 / 1 / 5 / 3', notes: [] },
      { id: 'revenue', title: 'Intäktsflöden', gridArea: '4 / 3 / 5 / 6', notes: [] },
    ];

    // Skapa sektioner som kan flyttas och storleksändras
    const sectionElements = {};
    sectionsData.forEach(sectionData => {
      const section = createDraggableSection(sectionData, grid);
      sectionElements[sectionData.id] = section;
      grid.appendChild(section);
    });

    // Lägg till redigeringslinjer för sektioner (om tillståndet är nytt)
    if (!initialState) {
      drawRelationLines();
    }

    // Verktygspanel
    createToolbox(container, canvasContainer, grid, sectionElements);

    // Lägg till relationspanel för markerade element
    createRelationPanel(container);

    // Ladda tillbaka sparat tillstånd om det finns
    if (initialState) {
      loadCanvasState(initialState);
    }

    // Funktion för att skapa en flyttbar och storleksändringsbar sektion
    function createDraggableSection(sectionData, grid) {
      const section = document.createElement('div');
      section.id = `section-${sectionData.id}`;
      section.className = 'grid-section';
      section.setAttribute('data-id', sectionData.id);
      section.style.gridArea = sectionData.gridArea;
      section.style.border = '1px solid #a9a9a9';
      section.style.backgroundColor = '#fff';
      section.style.display = 'flex';
      section.style.flexDirection = 'column';
      section.style.overflow = 'hidden';
      section.style.position = 'relative';
      section.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease, background-color 0.3s ease';
      section.style.minHeight = '100px';
      section.style.minWidth = '100px';
      
      // Rubrikdel
      const header = document.createElement('div');
      header.className = 'section-header';
      header.style.padding = '8px 10px';
      header.style.backgroundColor = '#f9f9f9';
      header.style.borderBottom = '1px solid #eee';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.cursor = 'move';
      header.style.transition = 'background-color 0.3s ease';
      
      const title = document.createElement('div');
      title.className = 'section-title';
      title.contentEditable = 'true';
      title.textContent = sectionData.title;
      title.style.color = '#000';
      title.style.fontWeight = 'bold';
      title.style.fontSize = '14px';
      title.style.flex = '1';
      title.style.outline = 'none';
      
      // Formatering för sektionsrubriker
      title.addEventListener('click', (e) => {
        e.stopPropagation();
        showFormattingToolbar(title);
      });
      
      header.appendChild(title);
      
      // Knapp för att lägga till ny post-it
      const addButton = document.createElement('button');
      addButton.innerHTML = '➕';
      addButton.style.background = 'none';
      addButton.style.border = 'none';
      addButton.style.cursor = 'pointer';
      addButton.style.fontSize = '14px';
      addButton.style.marginLeft = '5px';
      addButton.title = 'Lägg till anteckning';
      addButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const content = section.querySelector('.section-content');
        const note = addStickyNote(content, 'Ny anteckning', Math.random() * 20, Math.random() * 20);
        note.focus();
      });
      header.appendChild(addButton);
      
      section.appendChild(header);
      
      // Innehållsdel för post-it-lappar
      const content = document.createElement('div');
      content.className = 'section-content';
      content.style.flex = '1';
      content.style.padding = '10px';
      content.style.position = 'relative';
      content.style.minHeight = '100px';
      content.style.overflow = 'visible'; // Tillåter lappar utanför sektionens synliga område
      section.appendChild(content);
      
      // Gör sektionen flyttbar via rubriken
      header.addEventListener('mousedown', (e) => {
        if (e.target.closest('.section-title') && document.activeElement === e.target) {
          return; // Ignorera om vi klickade på titeln i redigeringsläge
        }
        
        e.preventDefault();
        
        section.style.zIndex = '1000';
        section.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
        section.style.opacity = '0.9';
        section.style.transition = 'none';
        
        // Håll reda på ursprunglig position
        const originalGridArea = section.style.gridArea;
        
        // Hämta position och storlek för alla sektioner
        const sections = document.querySelectorAll('.grid-section');
        const sectionPositions = Array.from(sections).map(s => {
          const rect = s.getBoundingClientRect();
          return {
            id: s.getAttribute('data-id'),
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
            element: s
          };
        });
        
        const rect = section.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        
        // Skapa en "spökelement" för att visa vart sektionen kommer placeras
        const ghost = document.createElement('div');
        ghost.style.position = 'absolute';
        ghost.style.width = `${rect.width}px`;
        ghost.style.height = `${rect.height}px`;
        ghost.style.backgroundColor = 'rgba(74, 134, 232, 0.2)';
        ghost.style.border = '2px dashed #4a86e8';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '999';
        ghost.style.display = 'none';
        ghost.style.transition = 'all 0.2s ease-out';
        canvasContainer.appendChild(ghost);
        
        let targetSection = null;
        
        const onMouseMove = (e) => {
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
          
          section.style.position = 'absolute';
          section.style.left = `${x}px`;
          section.style.top = `${y}px`;
          section.style.width = `${rect.width}px`;
          section.style.height = `${rect.height}px`;
          
          // Hitta målsektionen att byta plats med
          targetSection = null;
          for (const pos of sectionPositions) {
            if (pos.id !== section.getAttribute('data-id')) {
              const centerX = e.clientX;
              const centerY = e.clientY;
              
              if (centerX > pos.left && centerX < pos.right && 
                  centerY > pos.top && centerY < pos.bottom) {
                targetSection = pos;
                
                // Flytta undan kolliderande sektioner
                const targetRect = pos.element.getBoundingClientRect();
                const targetCenter = { 
                  x: targetRect.left + targetRect.width / 2,
                  y: targetRect.top + targetRect.height / 2
                };
                
                // Flytta andra sektioner som kolliderar
                sections.forEach(otherSection => {
                  if (otherSection !== section && otherSection !== pos.element) {
                    const otherRect = otherSection.getBoundingClientRect();
                    const isColliding = !(
                      otherRect.right < targetRect.left || 
                      otherRect.left > targetRect.right || 
                      otherRect.bottom < targetRect.top || 
                      otherRect.top > targetRect.bottom
                    );
                    
                    if (isColliding) {
                      const direction = {
                        x: otherRect.left + otherRect.width / 2 - targetCenter.x,
                        y: otherRect.top + otherRect.height / 2 - targetCenter.y
                      };
                      
                      // Normalisera riktningen
                      const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
                      if (length > 0) {
                        direction.x /= length;
                        direction.y /= length;
                      }
                      
                      const moveDistance = 20;
                      otherSection.style.transition = 'transform 0.2s ease-out';
                      otherSection.style.transform = `translate(${direction.x * moveDistance}px, ${direction.y * moveDistance}px)`;
                      
                      setTimeout(() => {
                        otherSection.style.transform = '';
                      }, 300);
                    }
                  }
                });
                
                break;
              }
            }
          }
          
          // Visa spökelementet på målsektionen
          if (targetSection) {
            ghost.style.display = 'block';
            ghost.style.left = `${targetSection.left}px`;
            ghost.style.top = `${targetSection.top}px`;
            ghost.style.width = `${targetSection.width}px`;
            ghost.style.height = `${targetSection.height}px`;
          } else {
            ghost.style.display = 'none';
          }
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Ta bort spökelementet
          ghost.remove();
          
          // Återställ sektionens stil
          section.style.position = '';
          section.style.left = '';
          section.style.top = '';
          section.style.width = '';
          section.style.height = '';
          section.style.zIndex = '';
          section.style.boxShadow = '';
          section.style.opacity = '';
          section.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';
          
          // Byt plats med målsektionen om det finns någon
          if (targetSection) {
            const targetGridArea = targetSection.element.style.gridArea;
            section.style.gridArea = targetGridArea;
            targetSection.element.style.gridArea = originalGridArea;
            
            // Uppdatera relationslinjerna
            drawRelationLines();
          } else {
            section.style.gridArea = originalGridArea;
          }
          
          // Spara tillstånd
          saveCanvasState();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      // Göra sektionen storleksändringsbar
      makeElementResizable(section);
      
      return section;
    }

    // Funktion för att göra ett element storleksändringsbart
    function makeElementResizable(element) {
      const resizeHandles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
      
      resizeHandles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${position}`;
        handle.style.position = 'absolute';
        handle.style.zIndex = '101';
        
        // Placering och stil för olika handtag
        if (position.includes('n')) handle.style.top = '-5px';
        if (position.includes('s')) handle.style.bottom = '-5px';
        if (position.includes('w')) handle.style.left = '-5px';
        if (position.includes('e')) handle.style.right = '-5px';
        
        if (position === 'n' || position === 's') {
          handle.style.left = '50%';
          handle.style.transform = 'translateX(-50%)';
          handle.style.width = '20px';
          handle.style.height = '10px';
          handle.style.cursor = 'ns-resize';
        } else if (position === 'e' || position === 'w') {
          handle.style.top = '50%';
          handle.style.transform = 'translateY(-50%)';
          handle.style.width = '10px';
          handle.style.height = '20px';
          handle.style.cursor = 'ew-resize';
        } else {
          handle.style.width = '10px';
          handle.style.height = '10px';
          handle.style.cursor = `${position}-resize`;
        }
        
        handle.style.backgroundColor = 'transparent';
        handle.style.border = 'none';
        
        // Visa visuell indikator vid hover
        handle.addEventListener('mouseenter', () => {
          handle.style.backgroundColor = '#007bff';
          handle.style.borderRadius = '50%';
        });
        
        handle.addEventListener('mouseleave', () => {
          handle.style.backgroundColor = 'transparent';
        });
        
        handle.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          element.style.transition = 'none';
          const startX = e.clientX;
          const startY = e.clientY;
          const startWidth = element.offsetWidth;
          const startHeight = element.offsetHeight;
          const startLeft = element.offsetLeft;
          const startTop = element.offsetTop;
          
          const onMouseMove = (e) => {
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            
            // Beräkna nya dimensioner baserat på handtagsposition
            if (position.includes('e')) {
              newWidth = startWidth + (e.clientX - startX);
            }
            if (position.includes('w')) {
              newWidth = startWidth - (e.clientX - startX);
              newLeft = startLeft + (e.clientX - startX);
            }
            if (position.includes('s')) {
              newHeight = startHeight + (e.clientY - startY);
            }
            if (position.includes('n')) {
              newHeight = startHeight - (e.clientY - startY);
              newTop = startTop + (e.clientY - startY);
            }
            
            // Använd grid-area för positionering om det är en sektion
            if (element.classList.contains('grid-section')) {
              // Implementera specifik storleksändring för grid-sektioner
              // Detta är komplext och kräver hantering av grid-area
            } else {
              // För andra element, använd direkta stilegenskaper
              if (newWidth >= 100) {
                element.style.width = `${newWidth}px`;
                element.style.left = `${newLeft}px`;
              }
              if (newHeight >= 100) {
                element.style.height = `${newHeight}px`;
                element.style.top = `${newTop}px`;
              }
            }
          };
          
          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            element.style.transition = 'box-shadow 0.2s ease, transform 0.2s ease';
            
            // Uppdatera relationslinjerna
            drawRelationLines();
            
            // Spara tillstånd
            saveCanvasState();
          };
          
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
        
        element.appendChild(handle);
      });
    }

    // Funktion för att lägga till en post-it-lapp
    function addStickyNote(container, text, x = 10, y = 10) {
      const randomRotation = Math.random() * 6 - 3; // Slumpmässig rotation mellan -3 och 3 grader
      
      const note = document.createElement('div');
      note.className = 'sticky-note';
      note.contentEditable = 'true';
      note.innerHTML = text;
      note.style.position = 'absolute';
      note.style.left = `${x}px`;
      note.style.top = `${y}px`;
      note.style.width = '120px';
      note.style.minHeight = '100px';
      note.style.padding = '15px';
      note.style.backgroundColor = '#ffffaa';
      note.style.border = '1px solid #E8E8E8';
      note.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)';
      note.style.transform = `rotate(${randomRotation}deg)`;
      note.style.fontFamily = 'Arial, sans-serif';
      note.style.fontSize = '14px';
      note.style.cursor = 'move';
      note.style.zIndex = '5';
      note.style.wordWrap = 'break-word';
      note.style.overflow = 'hidden';
      note.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      note.style.backgroundImage = 'linear-gradient(to bottom, #ffffcc 0%, #ffffaa 100%)';
      
      // Gör post-it-lappen markerings- och flyttbar
      makeStickyNoteInteractive(note, container);
      
      container.appendChild(note);
      return note;
    }

    // Gör en post-it lapp interaktiv (flyttbar, formaterbar, etc.)
    function makeStickyNoteInteractive(note, container) {
      // Skapa en "själva papperet" effekt med skugga
      const shadow = document.createElement('div');
      shadow.className = 'sticky-note-shadow';
      shadow.style.position = 'absolute';
      shadow.style.left = '3px';
      shadow.style.top = '3px';
      shadow.style.width = '100%';
      shadow.style.height = '100%';
      shadow.style.backgroundColor = 'rgba(0,0,0,0.05)';
      shadow.style.zIndex = '-1';
      shadow.style.pointerEvents = 'none';
      note.appendChild(shadow);
      
      // Formatering för innehåll
      note.addEventListener('focus', (e) => {
        note.style.boxShadow = '0 0 8px #007bff, 2px 2px 5px rgba(0,0,0,0.1)';
        note.style.zIndex = '100';
        
        // Markera noten som vald
        if (!selectedElements.includes(note)) {
          if (!e.shiftKey) {
            // Avmarkera andra om Shift inte hålls ned
            selectedElements.forEach(el => {
              el.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1)';
              el.classList.remove('selected-note');
            });
            selectedElements = [];
          }
          selectedElements.push(note);
          note.classList.add('selected-note');
        }
        
        // Visa formateringsverktyg
        showFormattingToolbar(note);
      });

      note.addEventListener('blur', (e) => {
        if (e.relatedTarget && 
            (e.relatedTarget.closest('.formatting-toolbar') || 
             e.relatedTarget.closest('.relation-panel'))) {
          note.focus();
          return;
        }
        
        note.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)';
        
        // Ta bort formatering-verktygsfältet om det finns
        const toolbar = document.querySelector('.formatting-toolbar');
        if (toolbar && !toolbar.contains(e.relatedTarget)) {
          toolbar.remove();
        }
      });

      // Gör noter markerbara via klick
      note.addEventListener('mousedown', (e) => {
        // Ignorera om vi klickar i redigeringsläge
        if (document.activeElement === note) return;
        
        if (e.shiftKey) {
          // Lägg till/ta bort från markering vid Shift+klick
          e.preventDefault();
          
          const index = selectedElements.indexOf(note);
          if (index === -1) {
            selectedElements.push(note);
            note.style.boxShadow = '0 0 8px #007bff, 2px 2px 5px rgba(0,0,0,0.1)';
            note.classList.add('selected-note');
          } else {
            selectedElements.splice(index, 1);
            note.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)';
            note.classList.remove('selected-note');
          }
          
          // Visa relationspanel om flera är markerade
          if (selectedElements.length >= 2) {
            showRelationPanel();
          } else {
            hideRelationPanel();
          }
          
          return;
        }
        
        // Avmarkera alla andra om vi inte klickar med Shift
        if (!selectedElements.includes(note)) {
          selectedElements.forEach(el => {
            el.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)';
            el.classList.remove('selected-note');
          });
          
          selectedElements = [note];
          note.style.boxShadow = '0 0 8px #007bff, 2px 2px 5px rgba(0,0,0,0.1)';
          note.classList.add('selected-note');
          
          hideRelationPanel();
        }
        
        // Starta drag and drop om vi inte klickar på text i edit-läge
        makeElementDraggable(note);
      });
      
      // Gör post-it storleksändringsbar
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'note-resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.right = '0';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.width = '12px';
      resizeHandle.style.height = '12px';
      resizeHandle.style.cursor = 'nwse-resize';
      resizeHandle.style.backgroundImage = 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.2) 50%)';
      resizeHandle.style.borderRadius = '0 0 3px 0';
      
      resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        note.style.transition = 'none';
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = note.offsetWidth;
        const startHeight = note.offsetHeight;
        
        const onMouseMove = (e) => {
          const newWidth = Math.max(100, startWidth + (e.clientX - startX));
          const newHeight = Math.max(80, startHeight + (e.clientY - startY));
          note.style.width = `${newWidth}px`;
          note.style.minHeight = `${newHeight}px`;
        };
        
        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          note.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
          
          // Uppdatera relationslinjerna
          drawRelationLines();
          
          // Spara tillstånd
          saveCanvasState();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      });
      
      note.appendChild(resizeHandle);
      
      // Rotera-knapp
      const rotateButton = document.createElement('div');
      rotateButton.className = 'note-rotate-button';
      rotateButton.innerHTML = '🔄';
      rotateButton.style.position = 'absolute';
      rotateButton.style.top = '3px';
      rotateButton.style.right = '3px';
      rotateButton.style.width = '16px';
      rotateButton.style.height = '16px';
      rotateButton.style.fontSize = '12px';
      rotateButton.style.lineHeight = '16px';
      rotateButton.style.textAlign = 'center';
      rotateButton.style.cursor = 'pointer';
      rotateButton.style.opacity = '0.5';
      rotateButton.style.background = 'rgba(255,255,255,0.8)';
      rotateButton.style.borderRadius = '50%';
      rotateButton.style.display = 'none';
      
      rotateButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const currentTransform = note.style.transform || '';
        const currentRotation = getRotationDegrees(note);
        const newRotation = currentRotation + 10;
        
        // Uppdatera rotation med bibehållen tidigare transformation
        const transformWithoutRotate = currentTransform.replace(/rotate\([^)]*\)/, '').trim();
        note.style.transform = `${transformWithoutRotate} rotate(${newRotation}deg)`.trim();
        
        // Uppdatera relationslinjerna
        drawRelationLines();
        
        // Spara tillstånd
        saveCanvasState();
      });
      
      // Visa rotera-knappen vid hover
      note.addEventListener('mouseenter', () => {
        rotateButton.style.display = 'block';
      });
      
      note.addEventListener('mouseleave', () => {
        rotateButton.style.display = 'none';
      });
      
      note.appendChild(rotateButton);
      
      // Ta bort-knapp
      const deleteButton = document.createElement('div');
      deleteButton.className = 'note-delete-button';
      deleteButton.innerHTML = '✖';
      deleteButton.style.position = 'absolute';
      deleteButton.style.top = '3px';
      deleteButton.style.left = '3px';
      deleteButton.style.width = '16px';
      deleteButton.style.height = '16px';
      deleteButton.style.fontSize = '12px';
      deleteButton.style.lineHeight = '16px';
      deleteButton.style.textAlign = 'center';
      deleteButton.style.cursor = 'pointer';
      deleteButton.style.opacity = '0.5';
      deleteButton.style.background = 'rgba(255,255,255,0.8)';
      deleteButton.style.borderRadius = '50%';
      deleteButton.style.display = 'none';
      
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Ta bort relationslinjer som involverar denna lapp
        relationLines = relationLines.filter(rel => 
          !rel.elements.includes(note)
        );
        
        // Ta bort från markerade element
        const index = selectedElements.indexOf(note);
        if (index !== -1) {
          selectedElements.splice(index, 1);
        }
        
        note.remove();
        drawRelationLines();
        
        // Spara tillstånd
        saveCanvasState();
      });
      
      // Visa ta bort-knappen vid hover
      note.addEventListener('mouseenter', () => {
        deleteButton.style.display = 'block';
      });
      
      note.addEventListener('mouseleave', () => {
        deleteButton.style.display = 'none';
      });
      
      note.appendChild(deleteButton);
    }

    // Gör ett element flyttbart
    function makeElementDraggable(element) {
      element.addEventListener('mousedown', initDrag);
      
      function initDrag(e) {
        // Ignorera vissa element och högerklick
        if (e.button !== 0 || 
            e.target.closest('.note-resize-handle') || 
            e.target.closest('.note-rotate-button') || 
            e.target.closest('.note-delete-button') ||
            e.target.closest('.resize-handle')) {
          return;
        }
        
        // Ignorera om vi klickar i redigeringsläge
        if (element.contentEditable === 'true' && document.activeElement === element) {
          return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = element.getBoundingClientRect();
        const offsetX = startX - rect.left;
        const offsetY = startY - rect.top;
        
        // Spara ursprunglig position och stil
        const originalZIndex = element.style.zIndex;
        const originalTransition = element.style.transition;
        
        // Förbered för flyttning
        element.style.zIndex = '1000';
        element.style.transition = 'none';
        
        // Skapa en skugga under elementet som flyttas
        const shadow = document.createElement('div');
        shadow.style.position = 'absolute';
        shadow.style.left = `${rect.left}px`;
        shadow.style.top = `${rect.top}px`;
        shadow.style.width = `${rect.width}px`;
        shadow.style.height = `${rect.height}px`;
        shadow.style.backgroundColor = 'rgba(0,0,0,0.1)';
        shadow.style.zIndex = '999';
        shadow.style.pointerEvents = 'none';
        shadow.style.borderRadius = '5px';
        shadow.style.transform = element.style.transform;
        document.body.appendChild(shadow);
        
        function onMouseMove(e) {
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
          
          if (element.parentElement.className === 'section-content') {
            // För post-it-lappar i en sektion
            const parentRect = element.parentElement.getBoundingClientRect();
            element.style.left = `${x - parentRect.left}px`;
            element.style.top = `${y - parentRect.top}px`;
          } else {
            // För andra element (t.ex. logotyp)
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
          }
          
          // Uppdatera skuggan
          shadow.style.left = `${e.clientX - offsetX + 5}px`;
          shadow.style.top = `${e.clientY - offsetY + 5}px`;
        }
        
        function onMouseUp(e) {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          
          // Återställ stilen med en smidig övergång
          element.style.zIndex = originalZIndex;
          element.style.transition = originalTransition || 'transform 0.2s ease, box-shadow 0.2s ease';
          
          // Ta bort skuggan med en övergångseffekt
          shadow.style.transition = 'opacity 0.2s ease';
          shadow.style.opacity = '0';
          setTimeout(() => shadow.remove(), 200);
          
          // Kontrollera om vi släpper en post-it i en annan sektion
          if (element.classList.contains('sticky-note')) {
            const sections = document.querySelectorAll('.grid-section');
            let newSection = null;
            
            sections.forEach(section => {
              const sectionRect = section.getBoundingClientRect();
              const elementRect = element.getBoundingClientRect();
              const centerX = elementRect.left + elementRect.width / 2;
              const centerY = elementRect.top + elementRect.height / 2;
              
              if (centerX >= sectionRect.left && centerX <= sectionRect.right &&
                  centerY >= sectionRect.top && centerY <= sectionRect.bottom) {
                newSection = section;
              }
            });
            
            if (newSection && newSection !== element.parentElement.closest('.grid-section')) {
              const sectionContent = newSection.querySelector('.section-content');
              const oldSection = element.parentElement;
              const oldPosition = {
                left: parseInt(element.style.left, 10) || 0,
                top: parseInt(element.style.top, 10) || 0
              };
              
              // Beräkna ny position relativt till den nya sektionen
              const oldRect = oldSection.getBoundingClientRect();
              const newRect = sectionContent.getBoundingClientRect();
              const globalLeft = oldRect.left + oldPosition.left;
              const globalTop = oldRect.top + oldPosition.top;
              
              // Flytta till den nya sektionen
              element.remove();
              sectionContent.appendChild(element);
              element.style.left = `${globalLeft - newRect.left}px`;
              element.style.top = `${globalTop - newRect.top}px`;
            }
          }
          
          // Uppdatera relationslinjerna
          drawRelationLines();
          
          // Spara tillstånd
          saveCanvasState();
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    }

    // Rita relationslinjerna mellan sammankopplade element
    function drawRelationLines() {
      // Ta bort befintliga linjer
      const oldLines = document.querySelectorAll('.relation-line');
      oldLines.forEach(line => line.remove());
      
      // Rita nya linjer
      relationLines.forEach(relation => {
        if (relation.elements.length >= 2) {
          for (let i = 0; i < relation.elements.length - 1; i++) {
            const element1 = relation.elements[i];
            const element2 = relation.elements[i + 1];
            
            if (document.body.contains(element1) && document.body.contains(element2)) {
              drawLineBetweenElements(element1, element2, relation.color || '#007bff');
            }
          }
        }
      });
    }

    // Rita en linje mellan två element
    function drawLineBetweenElements(element1, element2, color) {
      const rect1 = element1.getBoundingClientRect();
      const rect2 = element2.getBoundingClientRect();
      
      const canvasRect = canvasContainer.getBoundingClientRect();
      
      // Beräkna centrumpunkter relativt till canvas
      const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
      const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
      const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
      const y2 = rect2.top + rect2.height / 2 - canvasRect.top;
      
      // Beräkna linjens riktning och längd
      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      // Skapa en linje
      const line = document.createElement('div');
      line.className = 'relation-line';
      line.style.position = 'absolute';
      line.style.left = `${x1}px`;
      line.style.top = `${y1}px`;
      line.style.width = `${length}px`;
      line.style.height = '2px';
      line.style.backgroundColor = color;
      line.style.transformOrigin = '0 50%';
      line.style.transform = `rotate(${angle}deg)`;
      line.style.zIndex = '1';
      line.style.pointerEvents = 'none';
      
      // Lägg till en pil i slutet
      const arrow = document.createElement('div');
      arrow.style.position = 'absolute';
      arrow.style.right = '0';
      arrow.style.top = '-4px';
      arrow.style.width = '0';
      arrow.style.height = '0';
      arrow.style.borderTop = '5px solid transparent';
      arrow.style.borderBottom = '5px solid transparent';
      arrow.style.borderLeft = `8px solid ${color}`;
      line.appendChild(arrow);
      
      canvasContainer.appendChild(line);
      
      return line;
    }

    // Visa formateringsfält för textinnehåll
    function showFormattingToolbar(element) {
      // Ta bort befintlig toolbar
      const existingToolbar = document.querySelector('.formatting-toolbar');
      if (existingToolbar) existingToolbar.remove();
      
      // Skapa toolbar
      const toolbar = document.createElement('div');
      toolbar.className = 'formatting-toolbar';
      toolbar.style.position = 'absolute';
      toolbar.style.zIndex = '10000';
      toolbar.style.backgroundColor = '#fff';
      toolbar.style.border = '1px solid #ccc';
      toolbar.style.borderRadius = '3px';
      toolbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      toolbar.style.padding = '5px';
      toolbar.style.display = 'flex';
      toolbar.style.flexWrap = 'wrap';
      toolbar.style.gap = '5px';
      
      // Positionera verktygsfältet ovanför elementet
      const rect = element.getBoundingClientRect();
      const containerRect = canvasContainer.getBoundingClientRect();
      toolbar.style.left = `${rect.left - containerRect.left}px`;
      toolbar.style.top = `${rect.top - containerRect.top - 40}px`;
      
      // Formatering-knappar
      const formattingOptions = [
        { command: 'bold', icon: 'B', title: 'Fetstil' },
        { command: 'italic', icon: 'I', title: 'Kursiv' },
        { command: 'underline', icon: 'U', title: 'Understruken' },
        { command: 'strikeThrough', icon: 'S', title: 'Genomstruken' },
        { command: 'insertUnorderedList', icon: '•', title: 'Punktlista' },
        { command: 'insertOrderedList', icon: '1.', title: 'Numrerad lista' },
        { command: 'justifyLeft', icon: '⇐', title: 'Vänsterjustera' },
        { command: 'justifyCenter', icon: '⇔', title: 'Centrera' },
        { command: 'justifyRight', icon: '⇒', title: 'Högerjustera' }
      ];
      
      formattingOptions.forEach(option => {
        const button = document.createElement('button');
        button.innerHTML = option.icon;
        button.title = option.title;
        button.style.background = 'none';
        button.style.border = '1px solid #ccc';
        button.style.borderRadius = '3px';
        button.style.padding = '2px 8px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        
        button.addEventListener('click', () => {
          document.execCommand(option.command, false, null);
          element.focus();
        });
        
        toolbar.appendChild(button);
      });
      
      // Fontval
      const fontSelect = document.createElement('select');
      fontSelect.style.padding = '2px';
      fontSelect.style.border = '1px solid #ccc';
      fontSelect.style.borderRadius = '3px';
      
      const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];
      fonts.forEach(font => {
        const option = document.createElement('option');
        option.textContent = font;
        option.value = font;
        option.style.fontFamily = font;
        fontSelect.appendChild(option);
      });
      
      fontSelect.addEventListener('change', () => {
        document.execCommand('fontName', false, fontSelect.value);
        element.focus();
      });
      
      toolbar.appendChild(fontSelect);
      
      // Textstorlek
      const sizeSelect = document.createElement('select');
      sizeSelect.style.padding = '2px';
      sizeSelect.style.border = '1px solid #ccc';
      sizeSelect.style.borderRadius = '3px';
      
      [1, 2, 3, 4, 5, 6, 7].forEach(size => {
        const option = document.createElement('option');
        option.textContent = size;
        option.value = size;
        sizeSelect.appendChild(option);
      });
      
      sizeSelect.addEventListener('change', () => {
        document.execCommand('fontSize', false, sizeSelect.value);
        element.focus();
      });
      
      toolbar.appendChild(sizeSelect);
      
      // Textfärg
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.title = 'Textfärg';
      colorPicker.style.width = '25px';
      colorPicker.style.height = '25px';
      colorPicker.style.border = '1px solid #ccc';
      colorPicker.style.padding = '0';
      colorPicker.style.cursor = 'pointer';
      
      colorPicker.addEventListener('change', () => {
        document.execCommand('foreColor', false, colorPicker.value);
        element.focus();
      });
      
      toolbar.appendChild(colorPicker);
      
      // Bakgrundsfärg (för post-it)
      if (element.classList.contains('sticky-note')) {
        const bgColorPicker = document.createElement('input');
        bgColorPicker.type = 'color';
        bgColorPicker.title = 'Bakgrundsfärg';
        bgColorPicker.value = '#ffffaa';
        bgColorPicker.style.width = '25px';
        bgColorPicker.style.height = '25px';
        bgColorPicker.style.border = '1px solid #ccc';
        bgColorPicker.style.padding = '0';
        bgColorPicker.style.cursor = 'pointer';
        
        bgColorPicker.addEventListener('change', () => {
          element.style.backgroundColor = bgColorPicker.value;
          element.style.backgroundImage = 'none';
          element.focus();
          
          // Spara tillstånd
          saveCanvasState();
        });
        
        toolbar.appendChild(bgColorPicker);
      }
      
      canvasContainer.appendChild(toolbar);
      
      // Stäng toolbar när man klickar utanför
      const closeToolbar = (e) => {
        if (!toolbar.contains(e.target) && e.target !== element) {
          toolbar.remove();
          document.removeEventListener('mousedown', closeToolbar);
        }
      };
      
      // Kort fördröjning för att undvika att stänga direkt
      setTimeout(() => {
        document.addEventListener('mousedown', closeToolbar);
      }, 100);
      
      return toolbar;
    }

    // Skapa en panel för relationer
    function createRelationPanel(container) {
      const panel = document.createElement('div');
      panel.id = 'relation-panel';
      panel.style.position = 'fixed';
      panel.style.bottom = '20px';
      panel.style.left = '50%';
      panel.style.transform = 'translateX(-50%)';
      panel.style.backgroundColor = '#fff';
      panel.style.border = '1px solid #ccc';
      panel.style.borderRadius = '5px';
      panel.style.padding = '10px';
      panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
      panel.style.zIndex = '10000';
      panel.style.display = 'none';
      
      const panelTitle = document.createElement('div');
      panelTitle.textContent = 'Skapa relation mellan markerade element';
      panelTitle.style.fontWeight = 'bold';
      panelTitle.style.marginBottom = '10px';
      panel.appendChild(panelTitle);
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '10px';
      panel.appendChild(buttonContainer);
      
      // Knapp för att skapa relationer
      const createRelationBtn = document.createElement('button');
      createRelationBtn.textContent = 'Skapa relation';
      createRelationBtn.style.padding = '5px 10px';
      createRelationBtn.style.backgroundColor = '#007bff';
      createRelationBtn.style.color = '#fff';
      createRelationBtn.style.border = 'none';
      createRelationBtn.style.borderRadius = '3px';
      createRelationBtn.style.cursor = 'pointer';
      
      createRelationBtn.addEventListener('click', () => {
        if (selectedElements.length >= 2) {
          // Skapa en ny relation
          relationLines.push({
            elements: [...selectedElements],
            color: relationColorPicker.value
          });
          
          drawRelationLines();
          
          // Spara tillstånd
          saveCanvasState();
          
          hideRelationPanel();
        }
      });
      
      buttonContainer.appendChild(createRelationBtn);
      
      // Färgväljare för relationer
      const relationColorPicker = document.createElement('input');
      relationColorPicker.type = 'color';
      relationColorPicker.value = '#007bff';
      relationColorPicker.style.width = '30px';
      relationColorPicker.style.height = '30px';
      relationColorPicker.style.cursor = 'pointer';
      buttonContainer.appendChild(relationColorPicker);
      
      // Avsluta-knapp
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Avsluta';
      cancelBtn.style.padding = '5px 10px';
      cancelBtn.style.backgroundColor = '#f44336';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '3px';
      cancelBtn.style.cursor = 'pointer';
      
      cancelBtn.addEventListener('click', () => {
        // Avmarkera alla element
        selectedElements.forEach(el => {
          el.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.2)';
          el.classList.remove('selected-note');
        });
        
        selectedElements = [];
        hideRelationPanel();
      });
      
      buttonContainer.appendChild(cancelBtn);
      
      container.appendChild(panel);
    }

    // Visa relationspanelen
    function showRelationPanel() {
      const panel = document.getElementById('relation-panel');
      if (panel) panel.style.display = 'block';
    }

    // Dölj relationspanelen
    function hideRelationPanel() {
      const panel = document.getElementById('relation-panel');
      if (panel) panel.style.display = 'none';
    }

    // Funktion för att skapa verktygspanelen
    function createToolbox(container, canvasContainer, grid, sectionElements) {
      const toolbox = document.createElement('div');
      toolbox.id = 'bmc-toolbox';
      toolbox.style.position = 'fixed';
      toolbox.style.top = '20px';
      toolbox.style.right = '20px';
      toolbox.style.backgroundColor = '#fff';
      toolbox.style.border = '1px solid #ccc';
      toolbox.style.borderRadius = '5px';
      toolbox.style.padding = '10px';
      toolbox.style.zIndex = '10000';
      toolbox.style.display = 'flex';
      toolbox.style.flexDirection = 'column';
      toolbox.style.gap = '10px';
      toolbox.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      toolbox.style.transition = 'background-color 0.3s ease';
      container.appendChild(toolbox);

      // Mörkt/ljust läge
      const themeToggle = document.createElement('button');
      themeToggle.textContent = '🌓 Mörkt/Ljust läge';
      themeToggle.style.padding = '8px 12px';
      themeToggle.style.cursor = 'pointer';
      themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        
        if (isDarkMode) {
          container.style.backgroundColor = '#333';
          canvasContainer.style.backgroundColor = '#222';
          toolbox.style.backgroundColor = '#444';
          toolbox.style.color = '#fff';
          
          // Uppdatera sektioner och header
          document.querySelectorAll('.grid-section').forEach(section => {
            section.style.backgroundColor = '#333';
            section.style.borderColor = '#555';
          });
          
          document.querySelectorAll('.section-header').forEach(header => {
            header.style.backgroundColor = '#444';
            header.style.borderColor = '#555';
          });
          
          document.querySelectorAll('.section-title').forEach(title => {
            title.style.color = '#fff';
          });
          
          const headerElement = grid.querySelector('div:first-child');
          if (headerElement) {
            headerElement.style.backgroundColor = '#333';
            headerElement.style.borderColor = '#555';
          }
        } else {
          container.style.backgroundColor = '#f5f5f5';
          canvasContainer.style.backgroundColor = '#fff';
          toolbox.style.backgroundColor = '#fff';
          toolbox.style.color = '#000';
          
          // Återställ sektioner och header
          document.querySelectorAll('.grid-section').forEach(section => {
            section.style.backgroundColor = '#fff';
            section.style.borderColor = '#a9a9a9';
          });
          
          document.querySelectorAll('.section-header').forEach(header => {
            header.style.backgroundColor = '#f9f9f9';
            header.style.borderColor = '#eee';
          });
          
          document.querySelectorAll('.section-title').forEach(title => {
            title.style.color = '#000';
          });
          
          const headerElement = grid.querySelector('div:first-child');
          if (headerElement) {
            headerElement.style.backgroundColor = '#fff';
            headerElement.style.borderColor = '#eee';
          }
        }
      });
      toolbox.appendChild(themeToggle);

      // Zooma-knappar
      const zoomContainer = document.createElement('div');
      zoomContainer.style.display = 'flex';
      zoomContainer.style.justifyContent = 'space-between';
      zoomContainer.style.marginBottom = '10px';
      
      const zoomInBtn = document.createElement('button');
      zoomInBtn.textContent = '🔍+';
      zoomInBtn.style.padding = '5px 10px';
      zoomInBtn.style.cursor = 'pointer';
      zoomInBtn.addEventListener('click', () => {
        canvasScale += 0.1;
        canvasContainer.style.transform = `scale(${canvasScale})`;
        
        // Säkerställ att canvas är synlig
        adjustCanvasSize();
      });
      zoomContainer.appendChild(zoomInBtn);
      
      const zoomOutBtn = document.createElement('button');
      zoomOutBtn.textContent = '🔍-';
      zoomOutBtn.style.padding = '5px 10px';
      zoomOutBtn.style.cursor = 'pointer';
      zoomOutBtn.addEventListener('click', () => {
        canvasScale = Math.max(0.3, canvasScale - 0.1);
        canvasContainer.style.transform = `scale(${canvasScale})`;
      });
      zoomContainer.appendChild(zoomOutBtn);
      
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.textContent = '⛶';
      fullscreenBtn.style.padding = '5px 10px';
      fullscreenBtn.style.cursor = 'pointer';
      fullscreenBtn.title = 'Helskärm';
      fullscreenBtn.addEventListener('click', () => {
        if (!isFullscreen) {
          if (container.requestFullscreen) {
            container.requestFullscreen();
          } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
          } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
          } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
          }
          isFullscreen = true;
          fullscreenBtn.textContent = '⮾';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
          isFullscreen = false;
          fullscreenBtn.textContent = '⛶';
        }
      });
      zoomContainer.appendChild(fullscreenBtn);
      
      toolbox.appendChild(zoomContainer);

      // Knapp för att lägga till Post-it
      const addNoteBtn = document.createElement('button');
      addNoteBtn.textContent = '📝 Ny Post-it';
      addNoteBtn.style.padding = '8px 12px';
      addNoteBtn.style.cursor = 'pointer';
      addNoteBtn.addEventListener('click', () => {
        const note = document.createElement('div');
        note.style.position = 'fixed';
        note.style.top = '50%';
        note.style.left = '50%';
        note.style.transform = 'translate(-50%, -50%)';
        note.style.zIndex = '1000';
        note.style.backgroundColor = '#fff';
        note.style.padding = '10px';
        note.style.width = '200px';
        note.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
        note.style.borderRadius = '5px';
        
        const title = document.createElement('div');
        title.textContent = 'Välj sektion:';
        title.style.marginBottom = '10px';
        title.style.fontWeight = 'bold';
        note.appendChild(title);
        
        const sectionList = document.createElement('div');
        sectionList.style.display = 'flex';
        sectionList.style.flexDirection = 'column';
        sectionList.style.gap = '5px';
        
        sectionsData.forEach(section => {
          const option = document.createElement('button');
          option.textContent = section.title;
          option.style.padding = '5px';
          option.style.cursor = 'pointer';
          option.addEventListener('click', () => {
            const targetSection = sectionElements[section.id];
            const content = targetSection.querySelector('.section-content');
            const newNote = addStickyNote(
              content, 
              'Ny anteckning', 
              Math.random() * 20, 
              Math.random() * 20
            );
            
            note.remove();
            
            // Fokusera på den nya noten
            setTimeout(() => {
              newNote.focus();
            }, 10);
          });
          sectionList.appendChild(option);
        });
        
        note.appendChild(sectionList);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Avbryt';
        cancelBtn.style.marginTop = '10px';
        cancelBtn.style.padding = '5px';
        cancelBtn.style.width = '100%';
        cancelBtn.addEventListener('click', () => {
          note.remove();
        });
        note.appendChild(cancelBtn);
        
        document.body.appendChild(note);
      });
      toolbox.appendChild(addNoteBtn);

      // Exportera knapp
      const exportBtn = document.createElement('button');
      exportBtn.textContent = '💾 Exportera som bild';
      exportBtn.style.padding = '8px 12px';
      exportBtn.style.backgroundColor = '#4a86e8';
      exportBtn.style.color = 'white';
      exportBtn.style.border = 'none';
      exportBtn.style.borderRadius = '4px';
      exportBtn.style.marginTop = '20px';
      exportBtn.style.cursor = 'pointer';
      exportBtn.addEventListener('click', () => {
        // Dölj toolbox temporärt
        toolbox.style.display = 'none';
        
        html2canvas(canvasContainer).then(canvas => {
          toolbox.style.display = 'flex';
          
          const link = document.createElement('a');
          link.download = 'business_model_canvas.png';
          link.href = canvas.toDataURL();
          link.click();
        });
      });
      toolbox.appendChild(exportBtn);
      
      // Knapp för att spara tillstånd
      const saveBtn = document.createElement('button');
      saveBtn.textContent = '💾 Spara utkast';
      saveBtn.style.padding = '8px 12px';
      saveBtn.style.backgroundColor = '#4CAF50';
      saveBtn.style.color = 'white';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '4px';
      saveBtn.style.marginTop = '10px';
      saveBtn.style.cursor = 'pointer';
      saveBtn.addEventListener('click', () => {
        saveCanvasState();
        
        // Visa bekräftelse
        const confirmation = document.createElement('div');
        confirmation.textContent = 'Utkast sparat!';
        confirmation.style.position = 'fixed';
        confirmation.style.bottom = '20px';
        confirmation.style.left = '50%';
        confirmation.style.transform = 'translateX(-50%)';
        confirmation.style.backgroundColor = '#4CAF50';
        confirmation.style.color = 'white';
        confirmation.style.padding = '10px 20px';
        confirmation.style.borderRadius = '5px';
        confirmation.style.zIndex = '10001';
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
          confirmation.style.opacity = '0';
          confirmation.style.transition = 'opacity 0.5s ease';
          setTimeout(() => confirmation.remove(), 500);
        }, 2000);
      });
      toolbox.appendChild(saveBtn);
      
      // Knapp för att rensa allt
      const clearBtn = document.createElement('button');
      clearBtn.textContent = '🗑️ Rensa allt';
      clearBtn.style.padding = '8px 12px';
      clearBtn.style.backgroundColor = '#f44336';
      clearBtn.style.color = 'white';
      clearBtn.style.border = 'none';
      clearBtn.style.borderRadius = '4px';
      clearBtn.style.marginTop = '10px';
      clearBtn.style.cursor = 'pointer';
      clearBtn.addEventListener('click', () => {
        if (confirm('Är du säker på att du vill rensa allt? Detta kan inte ångras.')) {
          localStorage.removeItem('businessModelCanvas');
          window.location.reload();
        }
      });
      toolbox.appendChild(clearBtn);
    }

    // Hjälpfunktion för att hämta rotationsgrad
    function getRotationDegrees(element) {
      const style = window.getComputedStyle(element);
      const transform = style.transform || style.webkitTransform || style.mozTransform;
      
      if (transform === 'none' || transform === '') {
        return 0;
      }
      
      const matrix = transform.match(/^matrix\((.+)\)$/);
      if (matrix) {
        const values = matrix[1].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        return Math.round(Math.atan2(b, a) * (180 / Math.PI));
      }
      
      const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
      if (rotateMatch) {
        const rotateValue = rotateMatch[1];
        const degrees = parseFloat(rotateValue);
        return degrees;
      }
      
      return 0;
    }

    // Spara canvas-tillstånd
    function saveCanvasState() {
      const state = {
        sections: {},
        notes: [],
        logo: null,
        relations: relationLines,
        title: document.getElementById('canvas-title').innerHTML
      };
      
      // Spara sektionsinformation
      document.querySelectorAll('.grid-section').forEach(section => {
        const id = section.getAttribute('data-id');
        const title = section.querySelector('.section-title').textContent;
        const gridArea = section.style.gridArea;
        
        state.sections[id] = {
          title: title,
          gridArea: gridArea
        };
      });
      
      // Spara post-it-lappar
      document.querySelectorAll('.sticky-note').forEach(note => {
        const sectionId = note.closest('.grid-section').getAttribute('data-id');
        
        state.notes.push({
          sectionId: sectionId,
          content: note.innerHTML,
          left: note.style.left,
          top: note.style.top,
          width: note.style.width,
          height: note.style.minHeight,
          backgroundColor: note.style.backgroundColor,
          transform: note.style.transform
        });
      });
      
      // Spara logotyp om den finns
      const logoContainer = document.getElementById('logo-container');
      if (logoContainer && logoContainer.querySelector('img')) {
        state.logo = {
          src: logoContainer.querySelector('img').src,
          left: logoContainer.style.left,
          top: logoContainer.style.top,
          width: logoContainer.style.width,
          height: logoContainer.style.height
        };
      }
      
      // Spara till localStorage
      localStorage.setItem('businessModelCanvas', JSON.stringify(state));
    }

    // Ladda canvas-tillstånd
    function loadCanvasState(state) {
      // Återställ titel
      if (state.title) {
        document.getElementById('canvas-title').innerHTML = state.title;
      }
      
      // Återställ sektioner
      if (state.sections) {
        Object.keys(state.sections).forEach(id => {
          const sectionData = state.sections[id];
          const section = document.querySelector(`.grid-section[data-id="${id}"]`);
          
          if (section) {
            section.style.gridArea = sectionData.gridArea;
            section.querySelector('.section-title').textContent = sectionData.title;
          }
        });
      }
      
      // Återställ post-it-lappar
      if (state.notes) {
        // Rensa befintliga noter först
        document.querySelectorAll('.sticky-note').forEach(note => note.remove());
        
        state.notes.forEach(noteData => {
          const section = document.querySelector(`.grid-section[data-id="${noteData.sectionId}"]`);
          
          if (section) {
            const content = section.querySelector('.section-content');
            const note = addStickyNote(content, '', 0, 0);
            
            note.innerHTML = noteData.content;
            note.style.left = noteData.left;
            note.style.top = noteData.top;
            note.style.width = noteData.width;
            note.style.minHeight = noteData.height;
            note.style.backgroundColor = noteData.backgroundColor;
            note.style.transform = noteData.transform;
          }
        });
      }
      
      // Återställ logotyp
      if (state.logo) {
        const logoContainer = document.getElementById('logo-container');
        
        const img = document.createElement('img');
        img.src = state.logo.src;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        
        logoContainer.innerHTML = '';
        logoContainer.appendChild(img);
        logoContainer.style.border = 'none';
        
        logoContainer.style.left = state.logo.left;
        logoContainer.style.top = state.logo.top;
        logoContainer.style.width = state.logo.width;
        logoContainer.style.height = state.logo.height;
      }
      
      // Återställ relationer
      if (state.relations) {
        // Konvertera relationsobjekt tillbaka till DOM-referenser
        const notesMap = new Map();
        document.querySelectorAll('.sticky-note').forEach(note => {
          const sectionId = note.closest('.grid-section').getAttribute('data-id');
          const left = note.style.left;
          const top = note.style.top;
          
          // Skapa en nyckel som kan matcha notens position
          const key = `${sectionId}-${left}-${top}`;
          notesMap.set(key, note);
        });
        
        // Återskapa relationer
        relationLines = [];
        
        // Skapa dummyobjekt för att rita linjer - vi kan inte återställa de exakta referenserna
        // I stället använder vi ny funktionalitet för att låta användaren återskapa relationer
      }
      
      // Rita relationslinjerna
      drawRelationLines();
    }
  }
})();
