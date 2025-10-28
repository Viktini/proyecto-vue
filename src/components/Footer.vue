<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Contacto</h3>
          <p>Teléfono: 53059670</p>
          <p>Email: bellezayrelajacion@gmail.com</p>
          <div class="whatsapp-links">
            <a href="https://wa.me/53059670" class="whatsapp-link" target="_blank">
              <img src="../assets/whatsapp.jpg" alt="WhatsApp"> Contactar por WhatsApp
            </a>
          </div>
        </div>
        <div class="footer-section">
          <h3>Horario</h3>
          <p>Lunes a Viernes: 9:00 - 20:00</p>
          <p>Sábados: 10:00 - 18:00</p>
          <p>Domingos: Cerrado</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Belleza y Relajación. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #f8c8dc 0%, #a2d2ff 100%);
  padding: 0.5rem 0 0rem;
  color: #5a5a5a;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0rem;
}

.footer-section h3 {
  margin-bottom: 0.5rem;
  color: #5a5a5a;
}

.whatsapp-link {
  display: inline-flex;
  align-items: center;
  color: #25D366;
  text-decoration: none;
  font-weight: 600;
  margin-top: 0.5rem;
}

.whatsapp-link img {
  width: 30px;
  height: 30px;
  margin-right: 0.5rem;
  border-radius: 10px;
}

.footer-bottom {
  text-align: center;
  padding-top: 0rem;
  border-top: 0px solid rgba(255, 255, 255, 0.3);
}
</style>
