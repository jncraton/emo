;(function () {
  const input = document.getElementById('q')
  const results = document.getElementById('results')
  const count = document.getElementById('count')
  const copied = document.getElementById('copied')
  const title = document.getElementById('title')

  function escapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        })[c]
    )
  }

  function loadFromHash() {
    const h = decodeURIComponent(location.hash.slice(1) || '')
    input.value = h
  }

  function updateHash(q) {
    if (history.replaceState) {
      history.replaceState(null, '', '#' + encodeURIComponent(q))
    } else {
      location.hash = encodeURIComponent(q)
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
    }
    // fallback
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
    } catch (e) {}
    document.body.removeChild(ta)
    return Promise.resolve()
  }

  function render(list, q) {
    results.innerHTML = ''
    count.textContent = `${list.length} results`
    count.hidden = false
    // ensure copied indicator is hidden by default
    copied.hidden = true
    if (list.length === 0) {
      const li = document.createElement('li')
      li.textContent = 'No results'
      results.appendChild(li)
      return
    }
    list.forEach((item, idx) => {
      const li = document.createElement('li')
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.setAttribute('role', 'option')
      btn.dataset.name = item.name
      btn.dataset.emoji = item.emoji
      btn.innerHTML = `<span class="emoji">${escapeHtml(item.emoji)}</span><span class="name">${escapeHtml(item.name)}</span>`
      btn.addEventListener('click', () => {
        copyToClipboard(item.emoji).then(() => {
          // move the copied indicator into the clicked result and show it
          btn.appendChild(copied)
          copied.hidden = false
          setTimeout(() => (copied.hidden = true), 1200)
        })
      })
      li.appendChild(btn)
      results.appendChild(li)
    })
    // auto-copy first result and show copied indicator inside it
    if (list[0]) {
      copyToClipboard(list[0].emoji).then(() => {
        const firstBtn = results.querySelector('button')
        if (firstBtn) {
          firstBtn.appendChild(copied)
          copied.hidden = false
          setTimeout(() => (copied.hidden = true), 700)
        }
      })
    }
  }

  function search(q) {
    const nq = q.trim().toLowerCase()
    if (nq === '') return EMOJIS.slice(0, 50)
    return EMOJIS.filter((e) => e.name.includes(nq) || e.emoji.includes(nq))
  }

  input.addEventListener('input', (e) => {
    const v = e.target.value
    updateHash(v)
    const list = search(v)
    render(list, v)
  })

  loadFromHash()
  const initial = input.value
  const initList = search(initial)
  render(initList, initial)
  // keep input focused on load and prevent page jump
  try {
    input.focus({ preventScroll: true })
  } catch (e) {
    input.focus()
  }
  // remove page heading in favor of input as primary UI
  title && title.remove()
  // ensure title text is set for accessibility if element reappears
  // keep id usage consistent elsewhere
})()
