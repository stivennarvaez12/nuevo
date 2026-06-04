const fs = require('fs');

// Categorías y marcas base para combinarlas
const categorias = ['Aguardiente', 'Ron', 'Tequila', 'Wisky', 'Vodka', 'Ginebra'];
const marcas = {
  'Aguardiente': ['Aguardiente Antioqueño', 'Aguardiente Blanco del Valle', 'Aguardiente Néctar', 'Aguardiente Llanero'],
  'Ron': ['Ron Medellín', 'Ron Viejo de Caldas', 'Ron Santa Fe', 'Ron Zacapa', 'Ron Havana Club'],
  'Tequila': ['Tequila Don Julio', 'Tequila Jose Cuervo', 'Tequila Patrón', 'Tequila 1800', 'Tequila Herradura'],
  'Wisky': ['Buchanans', 'Old Parr', 'Chivas Regal', 'Johnnie Walker', 'Jack Daniels'],
  'Vodka': ['Vodka Smirnoff', 'Vodka Absolut', 'Vodka Grey Goose', 'Vodka Belvedere'],
  'Ginebra': ['Ginebra Tanqueray', 'Ginebra Bombay', 'Ginebra Hendricks', 'Ginebra Beefeater']
};

// Encabezados exactos como los tienes en tu Excel
let csvContent = "Nombre,Categoría,Precio Venta,Stock\n";

for (let i = 1; i <= 1000; i++) {
    // Escoger categoría y marca aleatoria
    let cat = categorias[Math.floor(Math.random() * categorias.length)];
    let marca = marcas[cat][Math.floor(Math.random() * marcas[cat].length)];
    
    // Le agregamos un "Lote / Edición" único para que la base de datos no lo tome como duplicado
    let nombre = `${marca} Edicion Especial Vol. ${i}`;
    
    // Precio aleatorio entre 20,000 y 300,000
    let precio = (Math.floor(Math.random() * 56) + 4) * 5000; 
    
    // Stock aleatorio entre 5 y 150
    let stock = Math.floor(Math.random() * 145) + 5;

    // Agregar la fila al CSV
    csvContent += `${nombre},${cat},${precio}.00,${stock}\n`;
}

// Guardar el archivo
fs.writeFileSync('Inventario_1000_Bebidas.csv', csvContent);
console.log("✅ ¡Éxito! Archivo 'Inventario_1000_Bebidas.csv' creado con 1000 productos únicos.");