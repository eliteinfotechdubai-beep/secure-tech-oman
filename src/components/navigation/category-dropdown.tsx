'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export interface Category {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: { url: string; altText?: string };
  parentHandle?: string;
  order?: number;
  subCategories: Category[];
}

export function CategoryDropdown() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/collections/organized');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 hover:text-primary transition-colors"
      >
        Categories
        <ChevronDown className="size-4" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-neutral-200 rounded-lg shadow-lg min-w-48 z-50">
        <div className="py-18">
          {categories.map((category) => (
            <div key={category.id}>
              <Link
                href={`/collections/${category.handle}`}
                className="block px-4 py-2 hover:bg-neutral-100 transition-colors text-neutral-900 font-medium"
              >
                {category.title}
              </Link>
              {category.subCategories.length > 0 && (
                <div className="bg-neutral-50 border-t border-neutral-200">
                  {category.subCategories.map((subCat) => (
                    <Link
                      key={subCat.id}
                      href={`/collections/${subCat.handle}`}
                      className="block px-6 py-2 hover:bg-neutral-100 transition-colors text-sm text-neutral-700"
                    >
                      {subCat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
