"use client";
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <p className="text-gray-600 text-lg">Your wishlist is empty</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-md relative">
              <button
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-4 right-4 text-red-600 hover:text-red-700"
              >
                <span className="text-2xl">❌</span>
              </button>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
