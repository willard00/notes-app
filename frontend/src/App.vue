<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// --- Config ---
const API_URL = import.meta.env.PROD 
  ? '/api/notes' 
  : 'http://localhost:3000/api/notes';

// --- State ---
const notes = ref([]);
const searchQuery = ref('');
const showModal = ref(false);
const modalMode = ref('create'); // 'create', 'view', 'edit'
const isLoading = ref(true);
const form = ref({ id: null, title: '', content: '' });

// --- Computed ---
const filteredNotes = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return notes.value.filter(n => 
    n.title.toLowerCase().includes(query) || 
    n.content.toLowerCase().includes(query)
  );
});

const modalTitle = computed(() => {
  if (modalMode.value === 'create') return 'Draft New Idea';
  if (modalMode.value === 'edit') return 'Edit Idea';
  return 'View Idea';
});

// --- Helper Functions ---
// NEW: Formats the date nicely
const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const getGradient = (id) => {
  const grads = [
    'from-pink-500 via-red-500 to-yellow-500',
    'from-blue-400 via-indigo-500 to-purple-500',
    'from-green-400 via-teal-500 to-emerald-500',
    'from-orange-400 via-pink-500 to-purple-600'
  ];
  return grads[id % grads.length] || grads[0];
};

// --- API Actions ---
const fetchNotes = async () => {
  isLoading.value = true;
  try {
    const res = await axios.get(API_URL);
    setTimeout(() => {
      notes.value = res.data;
      isLoading.value = false;
    }, 600);
  } catch (e) { 
    console.error(e); 
    isLoading.value = false;
  } 
};

const saveNote = async () => {
  if (!form.value.title || !form.value.content) return alert("✨ Please add a title and content!");
  
  try {
    if (modalMode.value === 'edit') {
      await axios.put(`${API_URL}/${form.value.id}`, form.value);
    } else {
      await axios.post(API_URL, form.value);
    }
    closeModal();
    fetchNotes();
  } catch (e) { console.error(e); }
};

const deleteNote = async (id) => {
  if (confirm("🗑️ Delete this note?")) {
    try {
      notes.value = notes.value.filter(n => n.id !== id);
      await axios.delete(`${API_URL}/${id}`);
      fetchNotes();
      if (showModal.value) closeModal();
    } catch (e) { console.error(e); }
  }
};

// --- UI Actions ---
const openModal = (note = null, mode = 'create') => {
  form.value = note ? { ...note } : { id: null, title: '', content: '' };
  modalMode.value = mode;
  showModal.value = true;
};

const closeModal = () => { showModal.value = false; };

const switchToEdit = () => {
  modalMode.value = 'edit';
};

const autoResize = (event) => {
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
};

onMounted(fetchNotes);
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative flex flex-col">
    
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px] animate-blob"></div>
      <div class="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-900/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-pink-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
    </div>

    <header class="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 shadow-sm shadow-black/20">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        <div class="flex items-center gap-4 group cursor-default">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            <div class="relative w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center text-white shadow-inner border border-white/10">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
          </div>
          <h1 class="text-2xl font-black tracking-tight text-white">
            Nexus<span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Notes</span>
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <div class="relative group hidden sm:block" v-if="notes.length > 0">
            <input 
              v-model="searchQuery" 
              placeholder="Search ideas..." 
              class="bg-slate-900/50 hover:bg-slate-800 border border-white/5 focus:border-indigo-500/50 rounded-full py-2.5 pl-11 pr-6 w-64 text-sm focus:ring-4 focus:ring-indigo-500/20 focus:bg-slate-900 transition-all duration-300 outline-none placeholder-slate-500 text-slate-200"
            />
            <svg class="w-5 h-5 text-slate-500 absolute left-4 top-2.5 transition-colors group-focus-within:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>

          <button 
            @click="openModal(null, 'create')" 
            class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span class="hidden sm:inline">New Note</span>
          </button>
        </div>
      </div>
    </header>

    <main class="flex-grow max-w-7xl w-full mx-auto px-6 py-8">
      
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        <div v-for="i in 6" :key="i" class="h-64 bg-slate-800/40 rounded-3xl border border-white/5 shadow-sm animate-pulse flex flex-col p-6">
          <div class="h-6 bg-slate-700/50 rounded w-2/3 mb-4"></div>
          <div class="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
          <div class="h-4 bg-slate-700/50 rounded w-5/6 mb-2"></div>
          <div class="mt-auto h-8 w-8 bg-slate-700/50 rounded-full ml-auto"></div>
        </div>
      </div>

      <div 
        v-else-if="filteredNotes.length === 0" 
        class="flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in"
      >
        <div class="relative group cursor-pointer" @click="openModal(null, 'create')">
          <div class="absolute -inset-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-10 blur-2xl group-hover:opacity-30 animate-pulse transition-opacity duration-500"></div>
          
          <div class="relative w-40 h-40 bg-slate-800 rounded-3xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 border border-white/5 backdrop-blur-xl animate-float">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-pink-500/10 rounded-3xl opacity-50"></div>
            <svg class="w-20 h-20 text-indigo-400 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <div class="absolute -right-2 -top-2 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg transform group-hover:rotate-90 transition-transform duration-300">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            </div>
          </div>
        </div>

        <h2 class="mt-10 text-4xl font-extrabold text-white tracking-tight">
          Your Canvas is Empty
        </h2>
        <p class="mt-4 text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
          Ideas are fleeting. Catch them before they fly away. Start your personal collection of thoughts now.
        </p>
        
        <button 
          @click="openModal(null, 'create')" 
          class="mt-8 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-900/50 hover:shadow-indigo-900/70 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
        >
          Create First Note
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
        </button>
      </div>

      <TransitionGroup 
        tag="div" 
        name="list" 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
        v-else
      >
        <div 
          v-for="note in filteredNotes" 
          :key="note.id" 
          @click="openModal(note, 'view')"
          class="group relative cursor-pointer bg-slate-900/60 backdrop-blur-sm rounded-3xl p-7 shadow-lg shadow-black/10 border border-white/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-auto min-h-[240px] overflow-hidden"
        >
          <div :class="`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getGradient(note.id)} opacity-80`"></div>

          <div class="flex-1">
            <h3 class="text-xl font-bold text-slate-100 mb-3 leading-snug pr-8">{{ note.title }}</h3>
            <p class="text-slate-400 leading-relaxed whitespace-pre-line text-sm font-medium opacity-90 line-clamp-4">{{ note.content }}</p>
          </div>

          <div class="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
             <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">
               {{ formatDate(note.created_at) }}
             </span>
             
             <div class="flex gap-2">
                <button 
                  @click.stop="openModal(note, 'edit')" 
                  class="p-2 rounded-full text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button 
                  @click.stop="deleteNote(note.id)" 
                  class="p-2 rounded-full text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
             </div>
          </div>
          </div>
      </TransitionGroup>
    </main>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" @click="closeModal"></div>
        
        <div class="bg-slate-900 rounded-[2rem] shadow-2xl shadow-black/50 w-full max-w-2xl relative z-10 overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
          
          <div class="bg-slate-800/30 px-8 py-6 border-b border-white/5 flex justify-between items-center backdrop-blur-sm shrink-0">
            <h2 class="text-xl font-bold text-slate-100">{{ modalTitle }}</h2>
            <div class="flex items-center gap-3">
              <button 
                v-if="modalMode === 'view'" 
                @click="deleteNote(form.id)"
                class="text-red-400 hover:text-red-500 transition-colors p-2" 
                title="Delete"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button @click="closeModal" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>

          <div class="p-8 space-y-6 bg-slate-900 overflow-y-auto custom-scrollbar">
            
            <div v-if="modalMode === 'view'" class="space-y-6">
              <div>
                <h3 class="text-3xl font-black text-white leading-tight">{{ form.title }}</h3>
              </div>
              <div class="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {{ form.content }}
              </div>
            </div>

            <div v-else class="space-y-6">
              <div class="space-y-2">
                <input v-model="form.title" placeholder="Give it a title..." class="w-full text-3xl font-black placeholder-slate-600 border-none focus:ring-0 p-0 text-white focus:outline-none bg-transparent"/>
              </div>
              <div class="space-y-2">
                <textarea v-model="form.content" @input="autoResize" placeholder="Start typing your thoughts here..." class="w-full min-h-[300px] text-lg text-slate-300 placeholder-slate-600 border-none focus:ring-0 p-0 focus:outline-none resize-none leading-relaxed bg-transparent"></textarea>
              </div>
            </div>

          </div>

          <div class="px-8 py-6 bg-slate-800/30 border-t border-white/5 flex justify-end gap-4 shrink-0">
            
            <button @click="closeModal" class="px-6 py-3 text-slate-400 font-bold hover:bg-slate-800 rounded-xl transition-all">
              Close
            </button>

            <button 
              v-if="modalMode === 'view'"
              @click="switchToEdit" 
              class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Edit Note
            </button>

            <button 
              v-else
              @click="saveNote" 
              class="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
            >
              {{ modalMode === 'edit' ? 'Save Changes' : 'Create Note' }}
            </button>

          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Updated scrollbar colors for dark mode */
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 20px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #64748b; }

.list-enter-active, .list-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
.list-move { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
.animation-delay-4000 { animation-delay: 4s; }

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-10px) rotate(1deg); }
}
.animate-float { animation: float 5s ease-in-out infinite; }
</style>