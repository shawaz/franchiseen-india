'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { QrCode, ShoppingCart, Trash2, Search, X } from 'lucide-react'
import { InStoreQRPayment } from '../payments/RazorpayCheckout'

interface Product {
    id: string
    name: string
    price: number
    category: string
    image?: string
}

interface OrderItem extends Product {
    cartItemId: string
    quantity: number
}

// Mock products for the UI
const MOCK_PRODUCTS: Product[] = [
    { id: '1', name: 'Signature Cold Brew', price: 250, category: 'Beverages' },
    { id: '2', name: 'Avocado Toast', price: 350, category: 'Food' },
    { id: '3', name: 'Matcha Latte', price: 300, category: 'Beverages' },
    { id: '4', name: 'Blueberry Muffin', price: 150, category: 'Pastries' },
    { id: '5', name: 'Croissant', price: 120, category: 'Pastries' },
    { id: '6', name: 'Iced Americano', price: 200, category: 'Beverages' },
    { id: '7', name: 'Club Sandwich', price: 400, category: 'Food' },
    { id: '8', name: 'Espresso', price: 150, category: 'Beverages' },
]

const CATEGORIES = ['All', 'Beverages', 'Food', 'Pastries']

interface POSScreenProps {
    franchiseId: string
    cashierId: string
}

export function POSScreen({ franchiseId, cashierId }: POSScreenProps) {
    const [activeCategory, setActiveCategory] = useState('All')
    const [cart, setCart] = useState<OrderItem[]>([])
    const [numpadValue, setNumpadValue] = useState('')
    const [isPaymentMode, setIsPaymentMode] = useState(false)

    const filteredProducts = MOCK_PRODUCTS.filter(
        (p) => activeCategory === 'All' || p.category === activeCategory
    )

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const gst = subtotal * 0.05 // 5% GST
    const total = subtotal + gst

    // If manual numpad value is entered, override cart logic for quick payments
    const isCustomAmount = numpadValue.length > 0
    const finalAmount = isCustomAmount ? parseInt(numpadValue) : total

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1, cartItemId: Date.now().toString() }]
        })
        setNumpadValue('') // Clear custom amount if using cart
    }

    const handleNumpadPress = (val: string) => {
        if (val === 'C') {
            setNumpadValue('')
        } else if (val === 'DEL') {
            setNumpadValue((prev) => prev.slice(0, -1))
        } else {
            setNumpadValue((prev) => prev + val)
        }
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] min-h-[600px] w-full gap-6 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">

            {/* LEFT PANEL: Menu Grid & Quick Categories */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto no-scrollbar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeCategory === cat
                                        ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-400 font-medium px-2">Cashier #{cashierId.slice(-4)}</span>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="flex flex-col text-left bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group h-32 justify-between"
                            >
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {product.name}
                                </span>
                                <div className="flex justify-between items-center w-full">
                                    <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-800 font-normal">
                                        {product.category}
                                    </Badge>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                        ₹{product.price}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT PANEL: Cart & Numpad & Payment */}
            <Card className="w-[380px] shrink-0 flex flex-col border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                {isPaymentMode ? (
                    <div className="flex-1 flex flex-col pt-8 items-center bg-zinc-50 dark:bg-zinc-900/40">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-2">Total Amount</h3>
                        <span className="text-5xl font-bold tracking-tight mb-8">₹{finalAmount}</span>

                        <div className="w-full px-6 flex-1 flex flex-col">
                            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center flex-1">
                                <InStoreQRPayment
                                    amountInr={finalAmount}
                                    franchiseId={franchiseId}
                                    cashierId={cashierId}
                                    description={`POS Order - ${isCustomAmount ? 'Custom' : `${cart.length} items`}`}
                                    onPaymentReceived={(id) => {
                                        console.log('Payment Success:', id)
                                        setCart([])
                                        setNumpadValue('')
                                        setIsPaymentMode(false)
                                    }}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                className="my-6"
                                onClick={() => setIsPaymentMode(false)}
                            >
                                Cancel Payment
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold">
                                <ShoppingCart className="w-5 h-5" /> Current Order
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-500 hover:text-red-500"
                                onClick={() => setCart([])}
                                disabled={cart.length === 0}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Cart Items Area (if cart has items, otherwise empty state) */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-zinc-950">
                            {cart.length > 0 ? (
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {cart.map((item) => (
                                            <div key={item.cartItemId} className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{item.name}</span>
                                                    <span className="text-xs text-zinc-500">₹{item.price} x {item.quantity}</span>
                                                </div>
                                                <span className="font-semibold text-sm">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    {numpadValue ? (
                                        <>
                                            <span className="text-sm text-zinc-500 mb-2">Custom Amount</span>
                                            <span className="text-5xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                                                ₹{numpadValue}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                                <ShoppingCart className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm text-zinc-500">Select items from the menu or enter a custom amount</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Quick Numpad Component built-in for fast entry when the cart is empty */}
                        {cart.length === 0 && (
                            <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-b border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((btn) => (
                                    <button
                                        key={btn}
                                        onClick={() => handleNumpadPress(btn)}
                                        className={`h-12 rounded-lg font-medium text-lg transition-colors ${typeof btn === 'number' || !isNaN(Number(btn))
                                                ? 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 shadow-sm border border-zinc-200 dark:border-zinc-700'
                                                : btn === 'C'
                                                    ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50'
                                                    : 'bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                                            }`}
                                    >
                                        {btn === 'DEL' ? <X className="w-5 h-5 mx-auto" /> : btn}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Footer / Total */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
                            {cart.length > 0 && (
                                <div className="space-y-1.5 mb-4 text-sm">
                                    <div className="flex justify-between text-zinc-500">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-zinc-500">
                                        <span>GST (5%)</span>
                                        <span>₹{gst.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-end mb-4">
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
                                <span className="text-2xl font-bold tracking-tight">
                                    ₹{(isCustomAmount ? parseInt(numpadValue) : total).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <Button
                                className="w-full h-14 text-lg font-medium group"
                                onClick={() => setIsPaymentMode(true)}
                                disabled={finalAmount === 0 || isNaN(finalAmount)}
                            >
                                <QrCode className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Generate Payment Request
                            </Button>
                        </div>
                    </>
                )}
            </Card>

        </div>
    )
}
