class NoteManager {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem('notes') || '[]');
    this.state = {
      drawing: false,
      isEraser: false,
      currentColor: '#6200ea',
      brushSize: 5,
      mediaRecorder: null,
      audioChunks: [],
      audioBlob: null,
    };
    this.elements = {
      modal: document.getElementById('noteModal'),
      canvas: document.getElementById('drawingCanvas'),
      ctx: document.getElementById('drawingCanvas')?.getContext('2d'),
      audioPlayback: document.getElementById('audioPlayback'),
    };
    this.init();
  }

  init() {
    document.querySelector('.dashboard').addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (card) this.openPanel(card.dataset.type);
    });
    this.loadSavedNotes();
    this.initDrawing();
  }

  openPanel(type) {
    document.querySelectorAll('.note-panel').forEach((panel) => (panel.style.display = 'none'));
    document.getElementById(`${type}Panel`).style.display = 'block';
    this.elements.modal.classList.add('active');
  }

  closeModal() {
    this.elements.modal.classList.remove('active');
    this.resetPanels();
  }

  async saveNote(type) {
    const title = document.getElementById(`${type}Title`)?.value.trim();
    const category = document.getElementById(`${type}Category`)?.value;
    if (!title) return alert('Please enter a title');

    let content;
    try {
      switch (type) {
        case 'text':
          content = document.getElementById('textContent').value.trim();
          if (!content) return alert('Enter note content');
          break;
        case 'list':
          content = Array.from(document.querySelectorAll('#listItems .list-item'))
            .map((item) => ({
              text: item.querySelector('input[type="text"]').value.trim(),
              checked: item.querySelector('input[type="checkbox"]').checked,
            }))
            .filter((item) => item.text);
          if (!content.length) return alert('Add at least one item');
          break;
        case 'draw':
          content = this.elements.canvas.toDataURL();
          break;
        case 'audio':
          if (!this.state.audioBlob) return alert('No audio recorded');
          content = await this.readFile(this.state.audioBlob);
          break;
        case 'image':
          const file = document.getElementById('imageInput').files[0];
          if (!file) return alert('Select an image');
          content = await this.readFile(file);
          break;
      }

      this.notes = this.notes.filter((note) => !(note.title === title && note.type === type));
      this.notes.push({ type, title, category, content, createdAt: new Date().toISOString() });
      localStorage.setItem('notes', JSON.stringify(this.notes));
      alert(`${type} note saved!`);
      this.loadSavedNotes();
      if (type !== 'saved') this.closeModal();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  }

  deleteNote(type) {
    const title = document.getElementById(`${type}Title`)?.value.trim();
    if (!title) return alert('Enter title to delete');
    this.notes = this.notes.filter((note) => !(note.title === title && note.type === type));
    localStorage.setItem('notes', JSON.stringify(this.notes));
    alert(`${type} note deleted!`);
    this.loadSavedNotes();
    this.closeModal();
  }

  clearAllNotes() {
    if (!confirm('Clear all notes?')) return;
    this.notes = [];
    localStorage.setItem('notes', JSON.stringify(this.notes));
    alert('All notes cleared!');
    this.loadSavedNotes();
    this.closeModal();
  }

  loadSavedNotes() {
    const container = document.getElementById('savedNotesList');
    container.innerHTML = '';
    const filter = document.getElementById('categoryFilter').value;
    const query = document.getElementById('searchInput').value.toLowerCase();

    const filteredNotes = this.notes.filter(
      (note) => (filter === 'all' || note.category === filter) && note.title.toLowerCase().includes(query)
    );

    if (!filteredNotes.length) {
      container.innerHTML = '<p>No notes found.</p>';
      return;
    }

    filteredNotes.forEach(({ type, title, content, category }) => {
      const div = document.createElement('div');
      div.innerHTML = `<strong>[${type.toUpperCase()}] ${title} (${category})</strong>`;
      div.onclick = () => {
        this.openPanel(type);
        document.getElementById(`${type}Title`).value = title;
        document.getElementById(`${type}Category`).value = category;
        switch (type) {
          case 'text':
            document.getElementById('textContent').value = content;
            break;
          case 'list':
            const listItems = document.getElementById('listItems');
            listItems.innerHTML = '';
            content.forEach(({ text, checked }) => {
              const item = document.createElement('div');
              item.className = 'list-item';
              item.innerHTML = `
                <input type="checkbox" ${checked ? 'checked' : ''} />
                <input type="text" value="${text.replace(/"/g, '"')}" />
              `;
              listItems.appendChild(item);
            });
            break;
          case 'draw':
            const img = new Image();
            img.onload = () => {
              this.elements.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
              this.elements.ctx.drawImage(img, 0, 0, this.elements.canvas.width, this.elements.canvas.height);
            };
            img.src = content;
            break;
          case 'audio':
            this.elements.audioPlayback.src = content;
            this.elements.audioPlayback.style.display = 'block';
            break;
          case 'image':
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${content}" alt="${title}" style="max-width: 100%; border-radius: 5px;" />`;
            break;
        }
      };
      container.appendChild(div);
    });
  }

  async readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  resetPanels() {
    document.querySelectorAll('.note-panel input[type="text"], .note-panel textarea').forEach((el) => (el.value = ''));
    document.getElementById('listItems').innerHTML = `
      <div class="list-item">
        <input type="checkbox" />
        <input type="text" placeholder="List item..." />
      </div>
    `;
    this.elements.audioPlayback.src = '';
    this.elements.audioPlayback.style.display = 'none';
    this.state.audioBlob = null;
    document.getElementById('imageInput').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    this.clearCanvas();
  }
initDrawing() {
    if (!this.elements.ctx) return;
    this.elements.ctx.lineCap = 'round';
    this.elements.ctx.strokeStyle = this.state.currentColor;
    this.elements.ctx.lineWidth = this.state.brushSize;

    document.getElementById('colorPicker').addEventListener('input', (e) => {
      this.state.currentColor = e.target.value;
      if (!this.state.isEraser) this.elements.ctx.strokeStyle = this.state.currentColor;
    });

    document.getElementById('brushSize').addEventListener('input', (e) => {
      this.state.brushSize = +e.target.value;
      this.elements.ctx.lineWidth = this.state.brushSize;
    });

    // Get canvas bounding box for accurate coordinates
    const getMousePos = (canvas, evt) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width; // Account for CSS scaling
      const scaleY = canvas.height / rect.height;
      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY,
      };
    };

    const draw = (e) => {
      if (!this.state.drawing) return;
      const { x, y } = getMousePos(this.elements.canvas, e);
      this.elements.ctx.lineWidth = this.state.brushSize;
      this.elements.ctx.strokeStyle = this.state.isEraser ? '#fff' : this.state.currentColor;
      this.elements.ctx.lineTo(x, y);
      this.elements.ctx.stroke();
      this.elements.ctx.beginPath();
      this.elements.ctx.moveTo(x, y);
    };

    this.elements.canvas.addEventListener('mousedown', (e) => {
      this.state.drawing = true;
      const { x, y } = getMousePos(this.elements.canvas, e);
      this.elements.ctx.beginPath();
      this.elements.ctx.moveTo(x, y);
    });

    this.elements.canvas.addEventListener('mouseup', () => (this.state.drawing = false));
    this.elements.canvas.addEventListener('mouseout', () => (this.state.drawing = false));
    this.elements.canvas.addEventListener('mousemove', this.debounce(draw, 10));
  }

  async startRecording() {
    if (!navigator.mediaDevices) return alert('Audio recording not supported');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.state.mediaRecorder = new MediaRecorder(stream);
      this.state.audioChunks = [];
      this.state.mediaRecorder.ondataavailable = (e) => this.state.audioChunks.push(e.data);
      this.state.mediaRecorder.onstop = () => {
        this.state.audioBlob = new Blob(this.state.audioChunks, { type: 'audio/webm' });
        this.elements.audioPlayback.src = URL.createObjectURL(this.state.audioBlob);
        this.elements.audioPlayback.style.display = 'block';
      };
      this.state.mediaRecorder.start();
      alert('Recording started...');
    } catch (err) {
      alert(`Failed to record: ${err.message}`);
    }
  }

  stopRecording() {
    if (this.state.mediaRecorder?.state === 'recording') {
      this.state.mediaRecorder.stop();
      this.state.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      alert('Recording stopped.');
    }
  }

  setEraser() {
    this.state.isEraser = true;
  }

  setBrush() {
    this.state.isEraser = false;
    this.elements.ctx.strokeStyle = this.state.currentColor;
  }

  clearCanvas() {
    this.elements.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
  }

  toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  }

  searchNotes() {
    this.loadSavedNotes();
  }

  filterNotes() {
    this.loadSavedNotes();
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

const noteApp = new NoteManager();

// Global functions for HTML onclick
const closeModal = () => noteApp.closeModal();
const saveNote = (type) => noteApp.saveNote(type);
const deleteNote = (type) => noteApp.deleteNote(type);
const clearAllNotes = () => noteApp.clearAllNotes();
const addListItem = () => {
  const listItems = document.getElementById('listItems');
  const item = document.createElement('div');
  item.className = 'list-item';
  item.innerHTML = `
    <input type="checkbox" />
    <input type="text" placeholder="List item..." />
  `;
  listItems.appendChild(item);
};
const startRecording = () => noteApp.startRecording();
const stopRecording = () => noteApp.stopRecording();
const setEraser = () => noteApp.setEraser();
const setBrush = () => noteApp.setBrush();
const clearCanvas = () => noteApp.clearCanvas();
const toggleTheme = () => noteApp.toggleTheme();
const searchNotes = () => noteApp.searchNotes();
const filterNotes = () => noteApp.filterNotes();

// Persist theme
window.onload = () => {
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
};