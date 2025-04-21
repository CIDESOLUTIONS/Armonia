
      {/* Formulario de Contacto */}
      <section id="contacto" className={`py-20 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                ¿Interesado en Armonía?
              </h2>
              <p className={`text-lg mb-6 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Complete el formulario y un representante se pondrá en contacto con usted para ofrecerle una demostración personalizada.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Soporte Premium</h3>
                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Respuesta garantizada en menos de 24 horas.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Capacitación Gratuita</h3>
                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Sesiones de capacitación para administradores y residentes.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <Building className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Migración de Datos</h3>
                    <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Le ayudamos a migrar los datos de su sistema actual.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit} className={`p-8 rounded-lg shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white border border-gray-200"}`}>
                <h3 className={`text-2xl font-bold mb-6 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Solicite más información</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Nombre completo</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="Ingrese su nombre"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Correo electrónico</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Teléfono</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label htmlFor="complexName" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Nombre del conjunto</label>
                    <input 
                      type="text" 
                      id="complexName" 
                      name="complexName" 
                      value={formData.complexName} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="Nombre del conjunto residencial"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="units" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Número de unidades</label>
                    <input 
                      type="number" 
                      id="units" 
                      name="units" 
                      value={formData.units} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="Ej. 30"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className={`block mb-2 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Mensaje</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      className={`w-full px-4 py-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      placeholder="¿En qué podemos ayudarle?"
                      rows={4}
                    ></textarea>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Enviar Solicitud
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${theme === "dark" ? "bg-gray-900 text-gray-400" : "bg-gray-900 text-gray-400"}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Producto</h3>
              <ul className="space-y-2">
                <li><a href="#funcionalidades" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#planes" className="hover:text-white">Planes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Acerca de</a></li>
                <li><a href="#contacto" className="hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentación</a></li>
                <li><a href="#" className="hover:text-white">Centro de ayuda</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-lg font-bold text-white mb-4 md:mb-0">Armonía</div>
            <div className="text-sm">© 2025 Armonía. Todos los derechos reservados.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
