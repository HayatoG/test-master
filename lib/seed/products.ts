export type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
};

export const CATEGORIES = ["Eletrônicos", "Livros", "Casa", "Esporte", "Moda"] as const;

/** Catálogo fixo usado pelo CRUD, pela loja e pela API pública. */
export const PRODUCTS: readonly Product[] = [
  { id: 1, name: "Fone Bluetooth Pulse", sku: "ELE-001", category: "Eletrônicos", price: 199.9, stock: 25, description: "Fone sem fio com cancelamento de ruído." },
  { id: 2, name: "Teclado Mecânico TKL", sku: "ELE-002", category: "Eletrônicos", price: 349.0, stock: 12, description: "Switches marrons, layout ABNT2." },
  { id: 3, name: "Mouse Sem Fio Glide", sku: "ELE-003", category: "Eletrônicos", price: 89.9, stock: 40, description: "Sensor óptico de 4000 DPI." },
  { id: 4, name: "Livro: Testes na Prática", sku: "LIV-001", category: "Livros", price: 74.5, stock: 30, description: "Guia de testes automatizados." },
  { id: 5, name: "Livro: Código Limpo", sku: "LIV-002", category: "Livros", price: 99.0, stock: 18, description: "Clássico sobre boas práticas." },
  { id: 6, name: "Caneca Térmica 500ml", sku: "CAS-001", category: "Casa", price: 59.9, stock: 60, description: "Mantém a temperatura por 6 horas." },
  { id: 7, name: "Luminária de Mesa LED", sku: "CAS-002", category: "Casa", price: 129.0, stock: 8, description: "Três níveis de intensidade." },
  { id: 8, name: "Garrafa Esportiva 1L", sku: "ESP-001", category: "Esporte", price: 45.0, stock: 75, description: "Livre de BPA." },
  { id: 9, name: "Tapete de Yoga", sku: "ESP-002", category: "Esporte", price: 110.0, stock: 0, description: "Antiderrapante, 6mm." },
  { id: 10, name: "Camiseta Dry Fit", sku: "MOD-001", category: "Moda", price: 69.9, stock: 50, description: "Tecido respirável." },
  { id: 11, name: "Mochila Urbana 20L", sku: "MOD-002", category: "Moda", price: 189.0, stock: 14, description: "Compartimento para notebook 15\"." },
  { id: 12, name: "Boné Clássico", sku: "MOD-003", category: "Moda", price: 50.0, stock: 100, description: "Ajuste traseiro com fivela." },
];

export function findProduct(id: number) {
  return PRODUCTS.find((p) => p.id === id);
}
