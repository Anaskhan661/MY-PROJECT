document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('.btn-send-message');
  const name = form.querySelector('input[name="name"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const subject = form.querySelector('input[name="subject"]').value.trim();
  const message = form.querySelector('textarea[name="message"]').value.trim();

  // Basic guard
  if (!name || !email || !subject || !message) {
    Swal.fire({
      icon: 'warning',
      title: 'Please fill all fields',
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const data = new FormData(form);
  // Ensure Formspree includes Reply-To and a clear subject line
  data.set('_replyto', email);
  if (!data.get('_subject')) {
    data.set('_subject', `New message from ${name}`);
  }
  // Enrich with metadata for better context in email
  data.set('page_url', window.location.href);
  data.set('submitted_at', new Date().toISOString());
  // Optional: send a copy to the sender if checked (Formspree supports this via _cc)
  if (form.querySelector('input[name="send_copy"]:checked')) {
    data.append('_cc', email);
  }

  // Disable button during submit
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.originalText = submitBtn.value || submitBtn.innerText;
    if (submitBtn.tagName === 'INPUT') {
      submitBtn.value = 'Sending...';
    } else {
      submitBtn.innerText = 'Sending...';
    }
  }

  fetch("https://formspree.io/f/mvgqalpr", {
    method: "POST",
    body: data,
    headers: { 'Accept': 'application/json' }
  })
    .then(response => {
      if (response.ok) {
        form.reset();
        Swal.fire({
          icon: 'success',
          title: 'Message Sent! ',
          html: `Thanks, <b>${name}</b>. I will reply to <code>${email}</code> soon.`,
          timer: 3500,
          showConfirmButton: false
        });
      } else {
        return response.json().then(err => { throw err; });
      }
    })
    .catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again.',
      });
    })
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        if (submitBtn.tagName === 'INPUT') {
          submitBtn.value = submitBtn.dataset.originalText || 'Send Message';
        } else {
          submitBtn.innerText = submitBtn.dataset.originalText || 'Send Message';
        }
      }
    });
});
