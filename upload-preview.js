const photoInput = document.getElementById('photo');
const preview = document.getElementById('preview');

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});
