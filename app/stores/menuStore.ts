import { defineStore } from 'pinia'

export interface MenuItem {
  id: number | string;
  name: string;
  price: number;
  desc: string;
  image: string;
  hasSize: boolean;
  sizes: { name: string; price: number }[];
  hasTopping: boolean;
  selectedToppings: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    categories: [
      {
        id: 'c1',
        name: 'Trà Sữa',
        items: [
          { id: 1, name: 'Trà Sữa Phúc Long', price: 45000, desc: 'Đậm vị trà tự nhiên', image: 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=200&h=200&fit=crop', hasSize: false, sizes: [], hasTopping: false, selectedToppings: [] },
          { id: 2, name: 'Trà Sữa Ô Long', price: 50000, desc: 'Thơm ngon, thanh mát', image: 'https://images.unsplash.com/photo-1517578239113-b03a12f6dd88?w=200&h=200&fit=crop', hasSize: false, sizes: [], hasTopping: false, selectedToppings: [] }
        ]
      },
      {
        id: 'c2',
        name: 'Cà Phê',
        items: [
          { id: 3, name: 'Cà phê Đen Đá', price: 30000, desc: 'Nguyên chất 100%', image: 'https://images.unsplash.com/photo-1514432324607-a125290ca862?w=200&h=200&fit=crop', hasSize: false, sizes: [], hasTopping: false, selectedToppings: [] },
          { id: 4, name: 'Bạc Xỉu', price: 35000, desc: 'Ngọt ngào, đậm vị', image: 'https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=200&h=200&fit=crop', hasSize: false, sizes: [], hasTopping: false, selectedToppings: [] }
        ]
      },
      {
        id: 'c3',
        name: 'Bánh Ngọt',
        items: [
          { id: 5, name: 'Tiramisu', price: 40000, desc: 'Bánh mềm, chuẩn vị Ý', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&h=200&fit=crop', hasSize: false, sizes: [], hasTopping: false, selectedToppings: [] }
        ]
      }
    ] as MenuCategory[]
  }),
  actions: {
    addItem(categoryId: string, item: Omit<MenuItem, 'id'>) {
      const category = this.categories.find(c => c.id === categoryId)
      if (category) {
        // Generate a random ID for mock persistence
        const newItem = { ...item, id: Date.now() }
        category.items.push(newItem)
      }
    }
  }
})
