fetch('http://localhost:5000/api/links').then(r=>r.text()).then(console.log).catch(console.error)
