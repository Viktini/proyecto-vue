<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>{{ $t('footer.contact') }}</h3>
          <p>{{ $t('footer.phone') }}: 53059670</p>
          <p>{{ $t('footer.email') }}: bellezayrelajacion@gmail.com</p>
          <div class="whatsapp-links">
            <a href="https://wa.me/53059670" class="whatsapp-link" target="_blank">
              <img src="../assets/whatsapp.jpg" alt="WhatsApp"> {{ $t('footer.whatsapp') }}
            </a>
          </div>
        </div>
        <div class="footer-section">
          <h3>{{ $t('footer.schedule') }}</h3>
          <p>{{ $t('footer.weekdays') }}: 9:00 - 20:00</p>
          <p>{{ $t('footer.saturday') }}: 10:00 - 18:00</p>
          <p>{{ $t('footer.sunday') }}: {{ $t('footer.closed') }}</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Belleza y Relajación. {{ $t('footer.rights') }}</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  // ✅ NO necesita setup porque solo usa $t en el template
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
  font-size: 1.1rem;
}

.footer-section p {
  margin-bottom: 0.3rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

.whatsapp-link {
  display: inline-flex;
  align-items: center;
  color: #25D366;
  text-decoration: none;
  font-weight: 600;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.whatsapp-link img {
  width: 30px;
  height: 30px;
  margin-right: 0.5rem;
  border-radius: 10px;
  flex-shrink: 0;
}

.footer-bottom {
  text-align: center;
  padding-top: 0rem;
  border-top: 0px solid rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .footer {
    padding: 1rem 0 0.5rem;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }

  .footer-section h3 {
    font-size: 1rem;
  }

  .footer-section p {
    font-size: 0.85rem;
  }

  .whatsapp-link {
    font-size: 0.85rem;
    justify-content: center;
  }

  .whatsapp-link img {
    width: 25px;
    height: 25px;
  }

  .footer-bottom {
    font-size: 0.85rem;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 0.8rem 0 0.3rem;
  }

  .footer-section h3 {
    font-size: 0.95rem;
  }

  .footer-section p {
    font-size: 0.8rem;
  }

  .whatsapp-link {
    font-size: 0.8rem;
  }

  .whatsapp-link img {
    width: 22px;
    height: 22px;
  }
}
</style>