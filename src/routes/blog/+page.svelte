<script lang="ts">
  // Placeholder blog data
  const posts = [
    {
      id: 1,
      title: 'Cyberpunk UI in SvelteKit',
      date: '2025-06-01',
      description: 'How to build glowing, animated cyberpunk interfaces with SvelteKit and custom shaders.',
      category: 'UI/UX',
      thumbnail: '/textures/blog.jpg',
      featured: true
    },
    {
      id: 2,
      title: 'WebGL Planetary Systems',
      date: '2025-05-20',
      description: 'Procedural planets, orbits, and 3D scenes in the browser using Babylon.js.',
      category: 'WebGL',
      thumbnail: '/textures/projects.jpg',
      featured: false
    },
    {
      id: 3,
      title: 'Shader Tricks for Realistic Worlds',
      date: '2025-05-10',
      description: 'Noise, craters, and atmospheric effects for next-level planet shaders.',
      category: 'Shaders',
      thumbnail: '/textures/about.jpg',
      featured: false
    },
    {
      id: 4,
      title: 'SvelteKit Animations 101',
      date: '2025-04-28',
      description: 'A guide to smooth, interactive animations in SvelteKit apps.',
      category: 'UI/UX',
      thumbnail: '/textures/contact.jpg',
      featured: false
    },
    // More mock posts for scrolling
    {
      id: 5,
      title: 'Procedural Moons and Rings',
      date: '2025-04-15',
      description: 'Techniques for generating moons and planetary rings in WebGL scenes.',
      category: 'WebGL',
      thumbnail: '/textures/projects.jpg',
      featured: false
    },
    {
      id: 6,
      title: 'Cyberpunk Color Palettes',
      date: '2025-03-30',
      description: 'Choosing neon and dark color schemes for futuristic UIs.',
      category: 'UI/UX',
      thumbnail: '/textures/blog.jpg',
      featured: false
    },
    {
      id: 7,
      title: 'Optimizing Babylon.js Scenes',
      date: '2025-03-15',
      description: 'Performance tips for large, interactive 3D scenes in the browser.',
      category: 'WebGL',
      thumbnail: '/textures/projects.jpg',
      featured: false
    },
    {
      id: 8,
      title: 'Advanced Shader Effects',
      date: '2025-03-01',
      description: 'Layering noise, lighting, and animation for stunning visuals.',
      category: 'Shaders',
      thumbnail: '/textures/about.jpg',
      featured: false
    },
    {
      id: 9,
      title: 'UI Microinteractions',
      date: '2025-02-20',
      description: 'Small details that make a big difference in user experience.',
      category: 'UI/UX',
      thumbnail: '/textures/contact.jpg',
      featured: false
    },
    {
      id: 10,
      title: 'Lighting in WebGL',
      date: '2025-02-10',
      description: 'How to use dynamic lighting for realism in 3D scenes.',
      category: 'WebGL',
      thumbnail: '/textures/projects.jpg',
      featured: false
    }
  ];
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];
  let selectedCategory = 'All';
  $: filteredPosts = selectedCategory === 'All' ? posts : posts.filter(p => p.category === selectedCategory);
  const featured = posts.find(p => p.featured);
</script>

<div class="blog-viewport">
  <div class="blog-main-layout">
    <aside class="blog-sidebar">
      <h3>Categories</h3>
      <ul class="category-list">
        {#each categories as cat}
          <li>
            <button class:active={cat === selectedCategory} on:click={() => selectedCategory = cat}>{cat}</button>
          </li>
        {/each}
      </ul>
    </aside>
    <section class="blog-content">
      {#if featured}
        <div class="featured-post">
          <img class="featured-thumb" src={featured.thumbnail} alt={featured.title} />
          <div class="featured-content">
            <h2>{featured.title}</h2>
            <div class="featured-meta">{featured.date} &mdash; <span>{featured.category}</span></div>
            <p>{featured.description}</p>
          </div>
        </div>
      {/if}
      <div class="blog-grid-row">
        {#each filteredPosts.filter(p => !p.featured) as post}
          <div class="blog-card">
            <img class="thumb" src={post.thumbnail} alt={post.title} />
            <div class="card-content">
              <h3>{post.title}</h3>
              <div class="meta">{post.date} &mdash; <span>{post.category}</span></div>
              <p>{post.description}</p>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
.blog-viewport {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: transparent;
  z-index: 10;
  pointer-events: none; /* Allow 3D scene interaction by default */
  animation: blog-scalein 0.7s cubic-bezier(.4,1.4,.6,1) both;
}
@keyframes blog-scalein {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(40px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.blog-main-layout,
.blog-sidebar,
.blog-content,
.blog-grid-row,
.category-list button,
.blog-card {
  pointer-events: auto; /* Enable interaction for UI elements */
}
.blog-main-layout {
  display: flex;
  gap: 2.5rem;
  max-width: 1200px;
  width: 100%;
  height: 80vh;
  margin: 0 auto;
  padding: 0 1.5rem;
  align-items: flex-start;
  background: rgba(24,24,40,0.65); /* More transparent for 3D reveal */
  border-radius: 1.5rem;
  box-shadow: 0 0 32px #00ffe7, 0 0 8px #a200ff;
  overflow: hidden;
  backdrop-filter: blur(2px) saturate(1.2);
  animation: blog-fadein 0.8s cubic-bezier(.4,1.4,.6,1) both;
}
@keyframes blog-fadein {
  from { opacity: 0; transform: scale(0.97) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.blog-sidebar {
  min-width: 180px;
  max-width: 220px;
  background: rgba(24,24,40,0.7);
  border: 2px solid #00ffe7;
  border-radius: 1.2rem;
  box-shadow: 0 0 16px #00ffe7, 0 0 4px #a200ff;
  padding: 2rem 1.2rem 1.2rem 1.2rem;
  height: 100%;
  margin-top: 0;
  overflow-y: auto;
  animation: sidebar-slidein 0.7s cubic-bezier(.4,1.4,.6,1) both;
}
@keyframes sidebar-slidein {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
.blog-content {
  flex: 1 1 0%;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.featured-post {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  background: linear-gradient(90deg, rgba(24,24,40,0.8) 60%, #a200ff22 100%);
  border: 2px solid #00ffe7;
  border-radius: 1.2rem;
  box-shadow: 0 0 24px #00ffe7, 0 0 8px #a200ff;
  margin-bottom: 2.5rem;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 2;
  animation: featured-fadein 0.9s cubic-bezier(.4,1.4,.6,1) both;
  max-height: 180px; /* Decreased height */
  min-height: 140px;
}
@keyframes featured-fadein {
  from { opacity: 0; transform: translateY(-30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.blog-grid-row {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2rem;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}
.blog-card {
  min-width: 320px;
  max-width: 340px;
  flex: 0 0 320px;
  scroll-snap-align: start;
  background: rgba(24,24,40,0.7);
  border: 1.5px solid #00ffe7;
  border-radius: 1rem;
  box-shadow: 0 0 12px #00ffe7, 0 0 2px #a200ff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s, box-shadow 0.15s;
  animation: card-popin 0.7s cubic-bezier(.4,1.4,.6,1) both;
}
.blog-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 0 32px #00ffe7, 0 0 8px #a200ff;
}
@keyframes card-popin {
  from { opacity: 0; transform: scale(0.95) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
.thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-bottom: 1.5px solid #a200ff;
}
.card-content {
  padding: 1.1rem 1.2rem 1.2rem 1.2rem;
}
.card-content h3 {
  color: #00ffe7;
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
  font-family: 'Orbitron', 'Share Tech Mono', monospace;
  text-shadow: 0 0 8px #00ffe7, 0 0 16px #a200ff;
}
.meta {
  color: #a200ff;
  font-size: 0.95rem;
  margin-bottom: 0.7rem;
}
.card-content p {
  color: #fff;
  font-size: 1rem;
  line-height: 1.5;
}
</style>