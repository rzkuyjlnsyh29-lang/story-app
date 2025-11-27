var A=r=>{throw TypeError(r)};var M=(r,e,t)=>e.has(r)||A("Cannot "+t);var c=(r,e,t)=>(M(r,e,"read from private field"),t?t.call(r):e.get(r)),b=(r,e,t)=>e.has(r)?A("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(r):e.set(r,t),S=(r,e,t,s)=>(M(r,e,"write to private field"),s?s.call(r,t):e.set(r,t),t),w=(r,e,t)=>(M(r,e,"access private method"),t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();class d{static getToken(){return localStorage.getItem("token")}static setToken(e){localStorage.setItem("token",e)}static removeToken(){localStorage.removeItem("token")}static isLoggedIn(){return!!this.getToken()}static getUserData(){const e=localStorage.getItem("userData");return e?JSON.parse(e):null}static setUserData(e){localStorage.setItem("userData",JSON.stringify(e))}static logout(){this.removeToken(),localStorage.removeItem("userData")}}const f={BASE_URL:"https://story-api.dicoding.dev/v1",MAP_TILE_LAYERS:{osm:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",satellite:"https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"}},v={REGISTER:`${f.BASE_URL}/register`,LOGIN:`${f.BASE_URL}/login`,STORIES:`${f.BASE_URL}/stories`,STORIES_GUEST:`${f.BASE_URL}/stories/guest`,PUSH_SUBSCRIBE:`${f.BASE_URL}/push/subscribe`};class g{static async register({name:e,email:t,password:s}){return(await fetch(v.REGISTER,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,email:t,password:s})})).json()}static async login({email:e,password:t}){return(await fetch(v.LOGIN,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})})).json()}static async getStories(e=1,t=20,s=!1){const a=new URL(v.STORIES);return a.searchParams.append("page",e),a.searchParams.append("size",t),a.searchParams.append("location",s?1:0),(await fetch(a,{headers:{Authorization:`Bearer ${d.getToken()}`}})).json()}static async addStory(e){return(await fetch(v.STORIES,{method:"POST",headers:{Authorization:`Bearer ${d.getToken()}`},body:e})).json()}static async addStoryGuest(e){return(await fetch(v.STORIES_GUEST,{method:"POST",body:e})).json()}static async subscribePush(e){return(await fetch(v.PUSH_SUBSCRIBE,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d.getToken()}`},body:JSON.stringify({subscription:e})})).json()}static async unsubscribePush(){return(await fetch(v.PUSH_SUBSCRIBE,{method:"DELETE",headers:{Authorization:`Bearer ${d.getToken()}`}})).json()}}const $="BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";function N(r){const e="=".repeat((4-r.length%4)%4),t=(r+e).replace(/-/g,"+").replace(/_/g,"/"),s=window.atob(t),a=new Uint8Array(s.length);for(let i=0;i<s.length;++i)a[i]=s.charCodeAt(i);return a}const k={async init(){if(!("serviceWorker"in navigator)||!("PushManager"in window)){console.warn("Push messaging is not supported");return}try{const r=await navigator.serviceWorker.ready;this._registration=r}catch(r){console.error("Service worker not ready:",r)}},async subscribe(){if(!this._registration)return console.error("Service worker registration not found."),null;if(await Notification.requestPermission()!=="granted")return console.log("Notification permission not granted."),null;try{const e=await this._registration.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:N($)});console.log("Push subscription successful:",e);try{const t=await g.subscribePush(e);t.error&&console.error("Failed to send subscription to server:",t.message)}catch(t){console.error("Error sending subscription to server:",t)}return e}catch(e){return console.error("Failed to subscribe to push:",e),null}},async isSubscribed(){return this._registration?await this._registration.pushManager.getSubscription()!==null:!1},async unsubscribe(){if(!this._registration)return!1;try{const r=await this._registration.pushManager.getSubscription();if(r){await r.unsubscribe();try{await g.unsubscribePush()}catch(e){console.error("Error notifying server of unsubscribe:",e)}return!0}return!1}catch(r){return console.error("Failed to unsubscribe:",r),!1}}};class q{async render(){const e=d.isLoggedIn(),t=d.getUserData();return`
 <section class="container" id="main-content-section" tabindex="-1">
        <div class="hero-section">
          <h1 tabindex="0">Selamat Datang di Story App</h1>
          <p tabindex="0">Berbagi cerita dan pengalaman menarik seputar Dicoding</p>
          
          ${e?`
            <div class="user-welcome">
              <h2>Halo, <strong>${t.name}</strong>!</h2>
              <div class="action-buttons">
                <a href="#/stories" class="btn-primary">Lihat Stories</a>
                <a href="#/add-story" class="btn-secondary">Tambah Story</a>
                <a href="#/map" class="btn-secondary">Lihat Peta</a>
                <div class="push-notification-toggle">
                  <label class="toggle-switch">
                    <input type="checkbox" id="pushNotificationToggle" aria-label="Aktifkan notifikasi push">
                    <span class="toggle-label">Notifikasi Push</span>
                  </label>
                </div>
                <button id="logoutBtn" class="btn-outline">Logout</button>
              </div>
            </div>
          `:`
            <div class="guest-welcome">
              <h2>Mulai Berbagi Cerita</h2>
              <div class="action-buttons">
                <a href="#/login" class="btn-primary">Login</a>
                <a href="#/register" class="btn-secondary">Daftar</a>
                <a href="#/stories" class="btn-outline">Lihat sebagai Guest</a>
              </div>
            </div>
          `}
        </div>
  
        <div class="features">
          <h2>Fitur Unggulan</h2>
          <div class="feature-grid">
            <div class="feature-card">
              <h3>📝 Berbagi Cerita</h3>
              <p>Bagikan pengalaman dan cerita menarik seputar Dicoding</p>
            </div>
            <div class="feature-card">
              <h3>🗺️ Peta Interaktif</h3>
              <p>Lihat lokasi cerita di peta dengan multiple layer</p>
            </div>
            <div class="feature-card">
              <h3>📱 Responsif</h3>
              <p>Akses dari berbagai perangkat dengan tampilan optimal</p>
            </div>
            <div class="feature-card">
              <h3>♿ Aksesibilitas</h3>
              <p>Didesain untuk semua pengguna termasuk difabel</p>
            </div>
          </div>
        </div>
      </section>
    `}async afterRender(){const e=document.getElementById("logoutBtn");e&&e.addEventListener("click",()=>{d.logout(),window.location.hash="#/"}),d.isLoggedIn()&&await this.initPushNotifications(),this.setupSkipToContent()}async initPushNotifications(){try{await k.init();const e=document.getElementById("pushNotificationToggle");if(!e)return;const t=await k.isSubscribed();e.checked=t,e.addEventListener("change",async s=>{s.target.checked?await k.subscribe()?(console.log("Push notification enabled"),this.showMessage("Notifikasi push diaktifkan","success")):(e.checked=!1,this.showMessage("Gagal mengaktifkan notifikasi push","error")):await k.unsubscribe()?(console.log("Push notification disabled"),this.showMessage("Notifikasi push dinonaktifkan","success")):(e.checked=!0,this.showMessage("Gagal menonaktifkan notifikasi push","error"))})}catch(e){console.error("Error initializing push notifications:",e)}}showMessage(e,t){const s=document.createElement("div");s.className=`message ${t}`,s.textContent=e,s.style.position="fixed",s.style.top="20px",s.style.right="20px",s.style.padding="12px 24px",s.style.borderRadius="4px",s.style.zIndex="10000",s.style.backgroundColor=t==="success"?"#10b981":"#ef4444",s.style.color="white",document.body.appendChild(s),setTimeout(()=>{s.remove()},3e3)}setupSkipToContent(){const e=document.getElementById("main-content-section");e&&(e.setAttribute("tabindex","-1"),e.setAttribute("role","main"))}}class O{async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <h1>About Page</h1>
      </section>
    `}async afterRender(){}}class R{async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="login-form">
          <h1 tabindex="0">Login</h1>
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                aria-required="true"
                autocomplete="email"
              >
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                aria-required="true"
                autocomplete="current-password"
                minlength="8"
              >
            </div>
            <button type="submit" class="btn-primary">Login</button>
          </form>
          <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
          <div id="message" class="message" aria-live="polite"></div>
        </div>
      </section>
    `}async afterRender(){const e=document.getElementById("loginForm");document.getElementById("message"),e.addEventListener("submit",async t=>{t.preventDefault();const s=new FormData(e),a=s.get("email"),i=s.get("password");if(!a||!i){this.showMessage("Email dan password harus diisi","error");return}if(i.length<8){this.showMessage("Password minimal 8 karakter","error");return}try{const n=await g.login({email:a,password:i});n.error?this.showMessage(n.message,"error"):(d.setToken(n.loginResult.token),d.setUserData(n.loginResult),this.showMessage("Login berhasil!","success"),setTimeout(()=>{window.location.hash="#/stories"},1e3))}catch{this.showMessage("Terjadi kesalahan saat login","error")}}),e.addEventListener("keydown",t=>{t.key==="Escape"&&(window.location.hash="#/")})}showMessage(e,t){const s=document.getElementById("message");s.textContent=e,s.className=`message ${t}`,s.setAttribute("aria-live","assertive")}}class U{async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="register-form">
          <h1 tabindex="0">Daftar Akun</h1>
          <form id="registerForm">
            <div class="form-group">
              <label for="name">Nama</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                aria-required="true"
                autocomplete="name"
              >
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                aria-required="true"
                autocomplete="email"
              >
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                aria-required="true"
                autocomplete="new-password"
                minlength="8"
              >
              <small>Password minimal 8 karakter</small>
            </div>
            <button type="submit" class="btn-primary">Daftar</button>
          </form>
          <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
          <div id="message" class="message" aria-live="polite"></div>
        </div>
      </section>
    `}async afterRender(){const e=document.getElementById("registerForm");document.getElementById("message"),e.addEventListener("submit",async t=>{t.preventDefault();const s=new FormData(e),a=s.get("name"),i=s.get("email"),n=s.get("password");if(!a||!i||!n){this.showMessage("Semua field harus diisi","error");return}if(n.length<8){this.showMessage("Password minimal 8 karakter","error");return}try{const o=await g.register({name:a,email:i,password:n});o.error?this.showMessage(o.message,"error"):(this.showMessage("Pendaftaran berhasil! Silakan login.","success"),setTimeout(()=>{window.location.hash="#/login"},2e3))}catch{this.showMessage("Terjadi kesalahan saat pendaftaran","error")}})}showMessage(e,t){const s=document.getElementById("message");s.textContent=e,s.className=`message ${t}`,s.setAttribute("aria-live","assertive")}}class j{constructor(){this.dbName="StoryAppDB",this.dbVersion=1,this.storeName="offlineStories",this.db=null}async init(){return new Promise((e,t)=>{const s=indexedDB.open(this.dbName,this.dbVersion);s.onerror=()=>{t(new Error("Failed to open IndexedDB"))},s.onsuccess=()=>{this.db=s.result,e(this.db)},s.onupgradeneeded=a=>{const i=a.target.result;if(!i.objectStoreNames.contains(this.storeName)){const n=i.createObjectStore(this.storeName,{keyPath:"id",autoIncrement:!1});n.createIndex("name","name",{unique:!1}),n.createIndex("description","description",{unique:!1}),n.createIndex("createdAt","createdAt",{unique:!1}),n.createIndex("synced","synced",{unique:!1})}}})}async addStory(e){return this.db||await this.init(),new Promise((t,s)=>{const i=this.db.transaction([this.storeName],"readwrite").objectStore(this.storeName),n={...e,synced:e.synced!==void 0?e.synced:!1,savedAt:new Date().toISOString()},o=i.add(n);o.onsuccess=()=>{t(o.result)},o.onerror=()=>{s(new Error("Failed to add story to IndexedDB"))}})}async getAllStories(){return this.db||await this.init(),new Promise((e,t)=>{const i=this.db.transaction([this.storeName],"readonly").objectStore(this.storeName).getAll();i.onsuccess=()=>{e(i.result)},i.onerror=()=>{t(new Error("Failed to get stories from IndexedDB"))}})}async getStory(e){return this.db||await this.init(),new Promise((t,s)=>{const n=this.db.transaction([this.storeName],"readonly").objectStore(this.storeName).get(e);n.onsuccess=()=>{t(n.result)},n.onerror=()=>{s(new Error("Failed to get story from IndexedDB"))}})}async deleteStory(e){return this.db||await this.init(),new Promise((t,s)=>{const n=this.db.transaction([this.storeName],"readwrite").objectStore(this.storeName).delete(e);n.onsuccess=()=>{t(!0)},n.onerror=()=>{s(new Error("Failed to delete story from IndexedDB"))}})}async searchStories(e){this.db||await this.init();const t=await this.getAllStories(),s=e.toLowerCase();return t.filter(a=>{var o,l;const i=(o=a.name)==null?void 0:o.toLowerCase().includes(s),n=(l=a.description)==null?void 0:l.toLowerCase().includes(s);return i||n})}async filterStories(e){this.db||await this.init();let s=[...await this.getAllStories()];return e.synced!==void 0&&(s=s.filter(a=>a.synced===e.synced)),e.startDate&&(s=s.filter(a=>new Date(a.createdAt||a.savedAt)>=new Date(e.startDate))),e.endDate&&(s=s.filter(a=>new Date(a.createdAt||a.savedAt)<=new Date(e.endDate))),s}async sortStories(e="createdAt",t="desc"){return this.db||await this.init(),(await this.getAllStories()).sort((a,i)=>{let n=a[e],o=i[e];return(e==="createdAt"||e==="savedAt")&&(n=new Date(n||0).getTime(),o=new Date(o||0).getTime()),typeof n=="string"&&(n=n.toLowerCase(),o=o.toLowerCase()),t==="asc"?n>o?1:-1:n<o?1:-1})}async getUnsyncedStories(){return this.db||await this.init(),new Promise((e,t)=>{const n=this.db.transaction([this.storeName],"readonly").objectStore(this.storeName).index("synced").getAll(!1);n.onsuccess=()=>{e(n.result)},n.onerror=()=>{t(new Error("Failed to get unsynced stories"))}})}async markAsSynced(e){return this.db||await this.init(),new Promise((t,s)=>{const i=this.db.transaction([this.storeName],"readwrite").objectStore(this.storeName),n=i.get(e);n.onsuccess=()=>{const o=n.result;if(o){o.synced=!0;const l=i.put(o);l.onsuccess=()=>{t(!0)},l.onerror=()=>{s(new Error("Failed to mark story as synced"))}}else s(new Error("Story not found"))},n.onerror=()=>{s(new Error("Failed to get story"))}})}async clearAll(){return this.db||await this.init(),new Promise((e,t)=>{const i=this.db.transaction([this.storeName],"readwrite").objectStore(this.storeName).clear();i.onsuccess=()=>{e(!0)},i.onerror=()=>{t(new Error("Failed to clear IndexedDB"))}})}}const m=new j;class _{constructor(){this.stories=[],this.currentPage=1}async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Semua Cerita</h1>
          <div class="page-actions">
            <a href="#/map" class="btn-secondary">Lihat di Peta</a>
            ${d.isLoggedIn()?'<a href="#/add-story" class="btn-primary">Tambah Story</a>':""}
          </div>
        </div>
  
        <!-- FIX: Tambah h2 untuk hierarchy yang proper -->
        <h2 class="visually-hidden">Daftar cerita terbaru</h2>
  
        <div class="stories-container">
          <div id="storiesList" class="stories-grid" role="list" aria-label="Daftar cerita">
            <div class="loading">Memuat cerita...</div>
          </div>
          <div class="load-more-container">
            <button id="loadMoreBtn" class="btn-outline" style="display: none;">Muat Lebih Banyak</button>
          </div>
        </div>
      </section>
    `}async afterRender(){await this.loadStories(),this.setupEventListeners(),this.setupSkipToContent()}async loadStories(){try{const e=document.getElementById("storiesList");e.innerHTML='<div class="loading">Memuat cerita...</div>';const t=await g.getStories(this.currentPage,10);if(t.error)this.showError("Gagal memuat cerita");else{this.stories=t.listStory,this.displayStories();const s=document.getElementById("loadMoreBtn");t.listStory.length===10?s.style.display="block":s.style.display="none"}}catch{this.showError("Terjadi kesalahan saat memuat cerita")}}displayStories(){const e=document.getElementById("storiesList");if(this.stories.length===0){e.innerHTML='<div class="no-stories">Belum ada cerita yang dibagikan.</div>';return}e.innerHTML=this.stories.map(t=>`
      <article class="story-card" role="listitem">
        <div class="story-image">
          <img 
            src="${t.photoUrl}" 
            alt="${t.description}" 
            loading="lazy"
          >
          ${t.lat&&t.lon?`
            <div class="story-location-badge" title="Memiliki lokasi">
              📍
            </div>
          `:""}
        </div>
        <div class="story-content">
          <!-- FIX: ganti h3 jadi h2 untuk hierarchy yang benar -->
          <h2 class="story-title">${t.name}</h2>
          <p class="story-description">${t.description}</p>
          <div class="story-meta">
            <time datetime="${t.createdAt}">
              ${new Date(t.createdAt).toLocaleDateString("id-ID")}
            </time>
            ${t.lat&&t.lon?`
              <button 
                class="btn-location" 
                data-lat="${t.lat}" 
                data-lon="${t.lon}"
                aria-label="Lihat lokasi di peta"
              >
                Lihat Lokasi
              </button>
            `:""}
            <button 
              class="btn-outline save-story-btn" 
              data-story-id="${t.id}"
              aria-label="Simpan cerita untuk offline"
              title="Simpan untuk akses offline"
            >
              💾 Simpan
            </button>
          </div>
        </div>
      </article>
    `).join(""),e.querySelectorAll(".btn-location").forEach(t=>{t.addEventListener("click",s=>{const a=s.target.dataset.lat,i=s.target.dataset.lon;window.location.hash=`#/map?lat=${a}&lon=${i}`})}),e.querySelectorAll(".save-story-btn").forEach(t=>{t.addEventListener("click",async s=>{const a=s.target.dataset.storyId,i=this.stories.find(n=>n.id===a);i&&await this.saveStoryToIndexedDB(i)})})}async saveStoryToIndexedDB(e){try{if(await m.init(),await m.getStory(e.id)){this.showMessage("Cerita sudah tersimpan","info");return}await m.addStory({...e,synced:!0}),this.showMessage("Cerita berhasil disimpan untuk akses offline","success")}catch(t){console.error("Error saving story to IndexedDB:",t),this.showMessage("Gagal menyimpan cerita","error")}}showMessage(e,t){const s=document.createElement("div");s.className=`message ${t}`,s.textContent=e,s.style.position="fixed",s.style.top="20px",s.style.right="20px",s.style.padding="12px 24px",s.style.borderRadius="4px",s.style.zIndex="10000",s.style.backgroundColor=t==="success"?"#10b981":t==="error"?"#ef4444":"#3b82f6",s.style.color="white",document.body.appendChild(s),setTimeout(()=>{s.remove()},3e3)}setupEventListeners(){const e=document.getElementById("loadMoreBtn");e&&e.addEventListener("click",async()=>{this.currentPage++,await this.loadMoreStories()})}async loadMoreStories(){try{const e=document.getElementById("loadMoreBtn");e.textContent="Memuat...",e.disabled=!0;const t=await g.getStories(this.currentPage,10);t.error||(this.stories=[...this.stories,...t.listStory],this.displayStories(),t.listStory.length<10&&(e.style.display="none"))}catch{this.showError("Gagal memuat lebih banyak cerita")}finally{const e=document.getElementById("loadMoreBtn");e.textContent="Muat Lebih Banyak",e.disabled=!1}}showError(e){const t=document.getElementById("storiesList");t.innerHTML=`<div class="error-message">${e}</div>`}setupSkipToContent(){const e=document.getElementById("main-content-section");e&&e.setAttribute("tabindex","-1")}}class H{constructor(){this.selectedLocation=null,this.map=null,this.photoFile=null}async render(){return d.isLoggedIn()?`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Tambah Cerita Baru</h1>
        </div>

        <form id="addStoryForm" class="add-story-form">
          <div class="form-section">
            <h2>Foto Cerita</h2>
            
            <div class="photo-upload">
              <div class="photo-preview-container">
                <img id="photoPreview" src="" alt="Preview foto" style="display: none;">
                <div id="photoPlaceholder" class="photo-placeholder">
                  <span>Belum ada foto</span>
                </div>
              </div>
              
              <div class="photo-actions">
                <label for="photoInput" class="btn-secondary">
                  📁 Pilih dari File
                </label>
                <button type="button" id="cameraBtn" class="btn-secondary">
                  📷 Ambil dari Kamera
                </button>
                <input 
                  type="file" 
                  id="photoInput" 
                  accept="image/*" 
                  style="display: none;"
                  aria-label="Pilih foto dari file"
                >
              </div>
              <div id="photoError" class="error-message" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-section">
            <h2>Deskripsi Cerita</h2>
            <div class="form-group">
              <label for="description">Deskripsi *</label>
              <textarea 
                id="description" 
                name="description" 
                required
                aria-required="true"
                placeholder="Ceritakan pengalaman atau cerita menarik Anda..."
                rows="4"
              ></textarea>
              <div id="descriptionError" class="error-message" aria-live="polite"></div>
            </div>
          </div>

          <div class="form-section">
            <h2>Lokasi (Opsional)</h2>
            <p>Klik pada peta untuk memilih lokasi</p>
            
            <div id="locationMap" class="location-map">
              <div class="map-loading">Memuat peta...</div>
            </div>
            
            <div class="location-info">
              <div id="locationStatus">Belum memilih lokasi</div>
              <button type="button" id="clearLocationBtn" class="btn-outline" style="display: none;">
                Hapus Lokasi
              </button>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" id="submitBtn">
              Publikasikan Cerita
            </button>
            <a href="#/stories" class="btn-outline">Batal</a>
          </div>

          <div id="formMessage" class="message" aria-live="polite"></div>
        </form>
      </section>
    `:`
        <section class="container" id="main-content-section">
          <div class="auth-required">
            <h2>Login Diperlukan</h2>
            <p>Anda harus login untuk menambahkan cerita.</p>
            <a href="#/login" class="btn-primary">Login</a>
          </div>
        </section>
      `}async afterRender(){d.isLoggedIn()&&(await this.initMap(),this.setupEventListeners(),this.setupSkipToContent())}async initMap(){typeof L>"u"&&await this.loadLeaflet(),this.map=L.map("locationMap").setView([-6.2,106.8],10),L.tileLayer(f.MAP_TILE_LAYERS.osm,{attribution:"&copy; OpenStreetMap"}).addTo(this.map),this.map.on("click",e=>{this.selectLocation(e.latlng)}),document.querySelector("#locationMap .map-loading").style.display="none"}async loadLeaflet(){return new Promise(e=>{if(!document.querySelector('link[href*="leaflet"]')){const s=document.createElement("link");s.rel="stylesheet",s.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",document.head.appendChild(s)}const t=document.createElement("script");t.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",t.onload=e,document.head.appendChild(t)})}selectLocation(e){this.selectedLocation=e,this.locationMarker&&this.map.removeLayer(this.locationMarker),this.locationMarker=L.marker(e).addTo(this.map).bindPopup("Lokasi terpilih").openPopup(),document.getElementById("locationStatus").textContent=`Lokasi terpilih: ${e.lat.toFixed(4)}, ${e.lng.toFixed(4)}`,document.getElementById("clearLocationBtn").style.display="block"}setupEventListeners(){document.getElementById("photoInput").addEventListener("change",e=>{this.handlePhotoSelect(e.target.files[0])}),document.getElementById("cameraBtn").addEventListener("click",()=>{this.openCamera()}),document.getElementById("clearLocationBtn").addEventListener("click",()=>{this.clearLocation()}),document.getElementById("addStoryForm").addEventListener("submit",e=>{e.preventDefault(),this.submitForm()}),document.getElementById("description").addEventListener("input",()=>{this.validateDescription()})}handlePhotoSelect(e){if(!e)return;if(!e.type.startsWith("image/")){this.showPhotoError("File harus berupa gambar");return}if(e.size>1*1024*1024){this.showPhotoError("Ukuran file maksimal 1MB");return}this.photoFile=e,this.showPhotoError("");const t=new FileReader;t.onload=s=>{const a=document.getElementById("photoPreview"),i=document.getElementById("photoPlaceholder");a.src=s.target.result,a.style.display="block",i.style.display="none"},t.readAsDataURL(e)}async openCamera(){try{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){this.showPhotoError("Kamera tidak didukung di browser ini");return}const e=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});this.showCameraModal(e)}catch(e){this.showPhotoError("Tidak dapat mengakses kamera: "+e.message)}}showCameraModal(e){const t=document.createElement("div");t.className="camera-modal",t.innerHTML=`
      <div class="camera-modal-content">
        <h3>Ambil Foto</h3>
        <video id="cameraVideo" autoplay playsinline></video>
        <div class="camera-actions">
          <button id="captureBtn" class="btn-primary">Ambil Foto</button>
          <button id="closeCameraBtn" class="btn-outline">Tutup</button>
        </div>
        <canvas id="cameraCanvas" style="display: none;"></canvas>
      </div>
    `,document.body.appendChild(t);const s=document.getElementById("cameraVideo");s.srcObject=e,document.getElementById("captureBtn").addEventListener("click",()=>{this.capturePhoto(s,e)}),document.getElementById("closeCameraBtn").addEventListener("click",()=>{this.closeCamera(e,t)}),t.addEventListener("click",a=>{a.target===t&&this.closeCamera(e,t)})}capturePhoto(e,t){const s=document.getElementById("cameraCanvas"),a=s.getContext("2d");s.width=e.videoWidth,s.height=e.videoHeight,a.drawImage(e,0,0),s.toBlob(i=>{this.handlePhotoSelect(i),this.closeCamera(t,document.querySelector(".camera-modal"))},"image/jpeg",.8)}closeCamera(e,t){e.getTracks().forEach(s=>s.stop()),t&&t.remove()}clearLocation(){this.selectedLocation=null,this.locationMarker&&(this.map.removeLayer(this.locationMarker),this.locationMarker=null),document.getElementById("locationStatus").textContent="Belum memilih lokasi",document.getElementById("clearLocationBtn").style.display="none"}validateDescription(){const e=document.getElementById("description").value,t=document.getElementById("descriptionError");return e.trim()?(t.textContent="",!0):(t.textContent="Deskripsi harus diisi",!1)}showPhotoError(e){document.getElementById("photoError").textContent=e}async submitForm(){const e=document.getElementById("submitBtn"),t=document.getElementById("formMessage");if(!this.validateDescription()){this.showMessage("Harap perbaiki error di form","error",t);return}if(!this.photoFile){this.showPhotoError("Foto harus diisi"),this.showMessage("Foto harus diisi","error",t);return}try{e.disabled=!0,e.textContent="Mempublikasikan...";const s=new FormData;s.append("description",document.getElementById("description").value),s.append("photo",this.photoFile),this.selectedLocation&&(s.append("lat",this.selectedLocation.lat),s.append("lon",this.selectedLocation.lng));const a=await g.addStory(s);a.error?this.showMessage(a.message,"error",t):(this.showMessage("Cerita berhasil dipublikasikan!","success",t),this.resetForm(),setTimeout(()=>{window.location.hash="#/stories"},2e3))}catch(s){this.showMessage("Terjadi kesalahan: "+s.message,"error",t)}finally{e.disabled=!1,e.textContent="Publikasikan Cerita"}}resetForm(){document.getElementById("addStoryForm").reset(),this.photoFile=null,this.clearLocation(),document.getElementById("photoPreview").style.display="none",document.getElementById("photoPlaceholder").style.display="block"}showMessage(e,t,s){s.textContent=e,s.className=`message ${t}`,s.setAttribute("aria-live","assertive")}setupSkipToContent(){const e=document.getElementById("main-content-section");e&&e.setAttribute("tabindex","-1")}}class C{constructor(){this.map=null,this.markers=[],this.stories=[]}async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Peta Cerita</h1>
          <p>Lihat lokasi semua cerita yang dibagikan</p>
        </div>

        <div class="map-controls">
          <div class="layer-controls">
            <button id="osmLayerBtn" class="btn-layer active" data-layer="osm">
              Peta Standar
            </button>
            <button id="satelliteLayerBtn" class="btn-layer" data-layer="satellite">
              Satellite
            </button>
          </div>
          <div class="map-stats">
            <span id="mapStats">Memuat data...</span>
          </div>
        </div>

        <div id="map" class="map-container" role="application" aria-label="Peta interaktif cerita">
          <div class="map-loading">Memuat peta...</div>
        </div>

        <div class="stories-sidebar">
          <h3>Cerita di Area Ini</h3>
          <div id="storiesList" class="stories-list"></div>
        </div>
      </section>
    `}async afterRender(){await this.initMap(),await this.loadStoriesWithLocation(),this.setupEventListeners(),this.setupSkipToContent(),this.handleQueryParams()}handleQueryParams(){const e=this.getQueryParams();if(e.lat&&e.lon){const t=parseFloat(e.lat),s=parseFloat(e.lon);this.map.flyTo([t,s],15);const a=this.stories.find(i=>Math.abs(i.lat-t)<.001&&Math.abs(i.lon-s)<.001);if(a){this.highlightStoryInList(a.id);const i=this.markers.find(n=>n.getLatLng().lat===a.lat&&n.getLatLng().lng===a.lon);i&&i.openPopup()}}}getQueryParams(){const t=(window.location.hash.replace("#","")||"/").split("?")[1];return t?Object.fromEntries(new URLSearchParams(t)):{}}async initMap(){if(!document.querySelector('link[href*="leaflet"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",document.head.appendChild(e)}typeof L>"u"&&await new Promise(e=>{const t=document.createElement("script");t.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",t.onload=e,document.head.appendChild(t)}),this.map=L.map("map").setView([-6.2,106.8],10),this.tileLayers={osm:L.tileLayer(f.MAP_TILE_LAYERS.osm,{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}),satellite:L.tileLayer(f.MAP_TILE_LAYERS.satellite,{attribution:"&copy; Google Maps"})},this.tileLayers.osm.addTo(this.map),document.querySelector(".map-loading").style.display="none"}async loadStoriesWithLocation(){try{const e=await g.getStories(1,50,!0);e.error||(this.stories=e.listStory.filter(t=>t.lat&&t.lon),this.displayStoriesOnMap(),this.updateStats(),this.displayStoriesList())}catch(e){console.error("Error loading stories:",e)}}displayStoriesOnMap(){if(this.markers.forEach(e=>this.map.removeLayer(e)),this.markers=[],this.stories.forEach(e=>{const t=L.marker([e.lat,e.lon]).addTo(this.map).bindPopup(`
          <div class="map-popup">
            <img src="${e.photoUrl}" alt="${e.description}" style="width: 100px; height: 100px; object-fit: cover;">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
            <small>${new Date(e.createdAt).toLocaleDateString("id-ID")}</small>
          </div>
        `);t.on("click",()=>{this.highlightStoryInList(e.id)}),this.markers.push(t)}),this.markers.length>0){const e=new L.featureGroup(this.markers);this.map.fitBounds(e.getBounds().pad(.1))}}displayStoriesList(){const e=document.getElementById("storiesList");if(this.stories.length===0){e.innerHTML="<p>Tidak ada cerita dengan lokasi.</p>";return}e.innerHTML=this.stories.map(t=>`
      <div class="story-list-item" data-story-id="${t.id}" tabindex="0">
        <img src="${t.photoUrl}" alt="${t.description}">
        <div class="story-info">
          <h4>${t.name}</h4>
          <p>${t.description.substring(0,100)}...</p>
        </div>
      </div>
    `).join(""),e.querySelectorAll(".story-list-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.storyId,a=this.stories.find(i=>i.id===s);a&&(this.flyToStory(a),this.highlightStoryInList(s))}),t.addEventListener("keydown",s=>{if(s.key==="Enter"||s.key===" "){s.preventDefault();const a=t.dataset.storyId,i=this.stories.find(n=>n.id===a);i&&(this.flyToStory(i),this.highlightStoryInList(a))}})})}flyToStory(e){this.map.flyTo([e.lat,e.lon],15);const t=this.markers.find(s=>s.getLatLng().lat===e.lat&&s.getLatLng().lng===e.lon);t&&t.openPopup()}highlightStoryInList(e){document.querySelectorAll(".story-list-item").forEach(s=>{s.classList.remove("active")});const t=document.querySelector(`[data-story-id="${e}"]`);t&&(t.classList.add("active"),t.focus())}updateStats(){const e=document.getElementById("mapStats");e.textContent=`${this.stories.length} cerita dengan lokasi`}setupEventListeners(){document.getElementById("osmLayerBtn").addEventListener("click",()=>{this.switchLayer("osm"),this.updateLayerButtons("osm")}),document.getElementById("satelliteLayerBtn").addEventListener("click",()=>{this.switchLayer("satellite"),this.updateLayerButtons("satellite")})}switchLayer(e){Object.values(this.tileLayers).forEach(t=>{this.map.removeLayer(t)}),this.tileLayers[e].addTo(this.map)}updateLayerButtons(e){document.querySelectorAll(".btn-layer").forEach(t=>{t.classList.toggle("active",t.dataset.layer===e)})}setupSkipToContent(){const e=document.getElementById("main-content-section");e&&e.setAttribute("tabindex","-1")}}class G{constructor(){this.stories=[],this.filteredStories=[],this.currentSort={field:"createdAt",order:"desc"},this.currentFilter={synced:void 0},this.searchQuery=""}async render(){return`
      <section class="container" id="main-content-section" tabindex="-1">
        <div class="page-header">
          <h1 tabindex="0">Cerita Offline</h1>
          <p>Kelola cerita yang disimpan untuk akses offline</p>
        </div>

        <div class="offline-stories-controls">
          <div class="controls-row">
            <div class="search-box">
              <input 
                type="text" 
                id="searchInput" 
                placeholder="Cari cerita..." 
                aria-label="Cari cerita"
              >
              <button id="searchBtn" class="btn-secondary" aria-label="Cari">🔍</button>
            </div>
            
            <div class="filter-controls">
              <select id="filterSelect" aria-label="Filter cerita">
                <option value="all">Semua Cerita</option>
                <option value="synced">Sudah Disinkronkan</option>
                <option value="unsynced">Belum Disinkronkan</option>
              </select>
            </div>

            <div class="sort-controls">
              <select id="sortField" aria-label="Urutkan berdasarkan">
                <option value="createdAt">Tanggal</option>
                <option value="name">Nama</option>
                <option value="description">Deskripsi</option>
              </select>
              <select id="sortOrder" aria-label="Urutan">
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
          </div>

          <div class="sync-controls">
            <button id="syncBtn" class="btn-primary" aria-label="Sinkronkan cerita offline">
              🔄 Sinkronkan ke Server
            </button>
            <button id="saveCurrentBtn" class="btn-secondary" aria-label="Simpan cerita saat ini">
              💾 Simpan Cerita Saat Ini
            </button>
          </div>
        </div>

        <div class="offline-stories-container">
          <div id="offlineStoriesList" class="stories-grid" role="list" aria-label="Daftar cerita offline">
            <div class="loading">Memuat cerita offline...</div>
          </div>
        </div>

        <div id="message" class="message" aria-live="polite"></div>
      </section>
    `}async afterRender(){await m.init(),await this.loadStories(),this.setupEventListeners(),this.setupSkipToContent()}async loadStories(){try{this.stories=await m.getAllStories(),this.applyFiltersAndSort(),this.displayStories()}catch(e){console.error("Error loading offline stories:",e),this.showMessage("Gagal memuat cerita offline","error")}}applyFiltersAndSort(){let e=[...this.stories];this.searchQuery&&(e=e.filter(t=>{var i,n;const s=(i=t.name)==null?void 0:i.toLowerCase().includes(this.searchQuery.toLowerCase()),a=(n=t.description)==null?void 0:n.toLowerCase().includes(this.searchQuery.toLowerCase());return s||a})),this.currentFilter.synced!==void 0&&(e=e.filter(t=>t.synced===this.currentFilter.synced)),e.sort((t,s)=>{let a=t[this.currentSort.field],i=s[this.currentSort.field];return(this.currentSort.field==="createdAt"||this.currentSort.field==="savedAt")&&(a=new Date(a||0).getTime(),i=new Date(i||0).getTime()),typeof a=="string"&&(a=a.toLowerCase(),i=i.toLowerCase()),this.currentSort.order==="asc"?a>i?1:-1:a<i?1:-1}),this.filteredStories=e}displayStories(){const e=document.getElementById("offlineStoriesList");if(this.filteredStories.length===0){e.innerHTML='<div class="no-stories">Tidak ada cerita offline yang tersimpan.</div>';return}e.innerHTML=this.filteredStories.map(t=>`
      <article class="story-card" role="listitem">
        <div class="story-image">
          <img 
            src="${t.photoUrl||"/images/logo.png"}" 
            alt="${t.description||"Story image"}" 
            loading="lazy"
            onerror="this.src='/images/logo.png'"
          >
          ${t.synced?`
            <div class="story-sync-badge synced" title="Sudah disinkronkan">✓</div>
          `:`
            <div class="story-sync-badge unsynced" title="Belum disinkronkan">⚠</div>
          `}
        </div>
        <div class="story-content">
          <h2 class="story-title">${t.name||"Tanpa Nama"}</h2>
          <p class="story-description">${t.description||""}</p>
          <div class="story-meta">
            <time datetime="${t.createdAt||t.savedAt}">
              ${new Date(t.createdAt||t.savedAt).toLocaleDateString("id-ID")}
            </time>
            <button 
              class="btn-outline delete-story-btn" 
              data-id="${t.id||t._id||"unknown"}"
              aria-label="Hapus cerita"
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      </article>
    `).join(""),e.querySelectorAll(".delete-story-btn").forEach(t=>{t.addEventListener("click",async s=>{const a=s.target.dataset.id;await this.deleteStory(a)})})}async deleteStory(e){if(confirm("Apakah Anda yakin ingin menghapus cerita ini?"))try{await m.deleteStory(e),this.showMessage("Cerita berhasil dihapus","success"),await this.loadStories()}catch(t){console.error("Error deleting story:",t),this.showMessage("Gagal menghapus cerita","error")}}async saveCurrentStories(){if(!d.isLoggedIn()){this.showMessage("Anda harus login untuk menyimpan cerita","error");return}try{const e=await g.getStories(1,50);if(e.error){this.showMessage("Gagal memuat cerita dari server","error");return}let t=0;for(const s of e.listStory)try{try{await m.getStory(s.id)||(await m.addStory({...s,synced:!0}),t++)}catch{try{await m.addStory({...s,synced:!0}),t++}catch(i){console.error("Error adding story:",i)}}}catch(a){console.error("Error saving story:",a)}this.showMessage(`Berhasil menyimpan ${t} cerita`,"success"),await this.loadStories()}catch(e){console.error("Error saving current stories:",e),this.showMessage("Gagal menyimpan cerita","error")}}async syncOfflineStories(){if(!d.isLoggedIn()){this.showMessage("Anda harus login untuk sinkronisasi","error");return}try{const e=await m.getUnsyncedStories();if(e.length===0){this.showMessage("Tidak ada cerita yang perlu disinkronkan","success");return}this.showMessage(`Menyinkronkan ${e.length} cerita...`,"info");let t=0,s=0;for(const a of e)try{const i=new FormData;if(i.append("description",a.description||""),a.photoUrl)try{const l=await(await fetch(a.photoUrl)).blob();i.append("photo",l,"photo.jpg")}catch{console.warn("Could not fetch photo for story:",a.id)}a.lat&&a.lon&&(i.append("lat",a.lat),i.append("lon",a.lon)),(await g.addStory(i)).error?s++:(await m.markAsSynced(a.id),t++)}catch(i){console.error("Error syncing story:",i),s++}this.showMessage(`Sinkronisasi selesai: ${t} berhasil, ${s} gagal`,t>0?"success":"error"),await this.loadStories()}catch(e){console.error("Error syncing offline stories:",e),this.showMessage("Gagal menyinkronkan cerita","error")}}setupEventListeners(){const e=document.getElementById("searchInput"),t=document.getElementById("searchBtn");e.addEventListener("input",l=>{this.searchQuery=l.target.value,this.applyFiltersAndSort(),this.displayStories()}),t.addEventListener("click",()=>{this.searchQuery=e.value,this.applyFiltersAndSort(),this.displayStories()}),document.getElementById("filterSelect").addEventListener("change",l=>{const I=l.target.value;I==="all"?this.currentFilter.synced=void 0:I==="synced"?this.currentFilter.synced=!0:I==="unsynced"&&(this.currentFilter.synced=!1),this.applyFiltersAndSort(),this.displayStories()});const a=document.getElementById("sortField"),i=document.getElementById("sortOrder");a.addEventListener("change",l=>{this.currentSort.field=l.target.value,this.applyFiltersAndSort(),this.displayStories()}),i.addEventListener("change",l=>{this.currentSort.order=l.target.value,this.applyFiltersAndSort(),this.displayStories()}),document.getElementById("syncBtn").addEventListener("click",()=>{this.syncOfflineStories()}),document.getElementById("saveCurrentBtn").addEventListener("click",()=>{this.saveCurrentStories()})}showMessage(e,t){const s=document.getElementById("message");s.textContent=e,s.className=`message ${t}`,s.setAttribute("aria-live","assertive"),setTimeout(()=>{s.textContent="",s.className="message"},5e3)}setupSkipToContent(){const e=document.getElementById("main-content-section");e&&e.setAttribute("tabindex","-1")}}const T={"/":new q,"/about":new O,"/login":new R,"/register":new U,"/stories":new _,"/add-story":new H,"/map":new C,"/offline-stories":new G,"/map/:id":new C};function V(r){const t=r.split("?")[0].split("/");return{resource:t[1]||null,id:t[2]||null,fullPath:r}}function z(r){let e="";return r.resource&&(e=e.concat(`/${r.resource}`)),r.id&&(e=e.concat("/:id")),e||"/"}function Y(){return location.hash.replace("#","")||"/"}function Q(){const r=Y(),e=V(r);return z(e)}class E{static async fadeIn(e){e.style.opacity="0",e.style.transform="translateY(20px)",e.style.transition="opacity 0.3s ease, transform 0.3s ease",await this.wait(50),e.style.opacity="1",e.style.transform="translateY(0)",await this.wait(300),e.style.transition=""}static async fadeOut(e){e.style.opacity="1",e.style.transform="translateY(0)",e.style.transition="opacity 0.2s ease, transform 0.2s ease",await this.wait(50),e.style.opacity="0",e.style.transform="translateY(-20px)",await this.wait(200)}static async slideIn(e,t="right"){const s={right:"translateX(100%)",left:"translateX(-100%)",up:"translateY(-100%)",down:"translateY(100%)"};e.style.transform=s[t]||s.right,e.style.opacity="0",e.style.transition="transform 0.4s ease, opacity 0.4s ease",await this.wait(50),e.style.transform="translateX(0) translateY(0)",e.style.opacity="1",await this.wait(400),e.style.transition=""}static async slideOut(e,t="left"){const s={right:"translateX(100%)",left:"translateX(-100%)",up:"translateY(-100%)",down:"translateY(100%)"};e.style.transform="translateX(0) translateY(0)",e.style.opacity="1",e.style.transition="transform 0.3s ease, opacity 0.3s ease",await this.wait(50),e.style.transform=s[t]||s.left,e.style.opacity="0",await this.wait(300)}static wait(e){return new Promise(t=>setTimeout(t,e))}}var u,y,h,B,p,D,x,P,F;class W{constructor({navigationDrawer:e,drawerButton:t,content:s}){b(this,p);b(this,u,null);b(this,y,null);b(this,h,null);b(this,B,null);S(this,u,s),S(this,y,t),S(this,h,e),w(this,p,D).call(this),w(this,p,x).call(this),w(this,p,P).call(this)}async renderPage(){const e=Q();let t=T[e];if(!t&&e.startsWith("/map")&&(t=T["/map/:id"]),!t){c(this,u).innerHTML="<h1>Halaman tidak ditemukan</h1>";return}document.startViewTransition?await document.startViewTransition(async()=>{await E.fadeOut(c(this,u)),c(this,u).innerHTML=await t.render(),await t.afterRender(),await E.fadeIn(c(this,u))}).finished:(await E.fadeOut(c(this,u)),c(this,u).innerHTML=await t.render(),await t.afterRender(),await E.fadeIn(c(this,u))),S(this,B,t),w(this,p,P).call(this)}}u=new WeakMap,y=new WeakMap,h=new WeakMap,B=new WeakMap,p=new WeakSet,D=function(){c(this,y).addEventListener("click",()=>{c(this,h).classList.toggle("open"),c(this,y).setAttribute("aria-expanded",c(this,h).classList.contains("open"))}),document.body.addEventListener("click",e=>{!c(this,h).contains(e.target)&&!c(this,y).contains(e.target)&&(c(this,h).classList.remove("open"),c(this,y).setAttribute("aria-expanded","false")),c(this,h).querySelectorAll("a").forEach(t=>{t.contains(e.target)&&(c(this,h).classList.remove("open"),c(this,y).setAttribute("aria-expanded","false"))})})},x=function(){const e=document.querySelector(".skip-link");e&&e.addEventListener("click",t=>{t.preventDefault(),w(this,p,F).call(this)})},P=function(){c(this,h).querySelectorAll("a").forEach(a=>{a.removeAttribute("aria-current")});const t=window.location.hash.replace("#","")||"/",s=c(this,h).querySelector(`a[href="#${t}"]`);s&&s.setAttribute("aria-current","page")},F=function(){const e=c(this,u).querySelector("#main-content-section");e&&(e.setAttribute("tabindex","-1"),e.focus(),e.scrollIntoView({behavior:"smooth"}))};document.addEventListener("DOMContentLoaded",async()=>{const r=new W({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")});await r.renderPage(),window.addEventListener("hashchange",async()=>{await r.renderPage()})});
