import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  business?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
  };
}

export default function InvoicePage() {
  const [match, params] = useRoute('/invoice/:invoiceId');
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: [`/api/invoices/${params?.invoiceId}`],
    enabled: !!params?.invoiceId,
  });

  const handleDownload = async () => {
    if (!invoice) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/invoices/download/${invoice._id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your invoice is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.querySelector('.print-invoice');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
            <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => window.history.back()} className="bg-emerald-600 hover:bg-emerald-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const business = invoice.business || { name: 'ZnForge POS', email: '', phone: '', address: '', currency: '$' };
  const currency = business.currency === 'BDT' ? '৳' : business.currency;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Success Message */}
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-800">Transaction Completed Successfully!</h2>
                  <p className="text-green-600">
                    Thank you for your business. Your invoice #{invoice.invoiceNumber} has been generated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={() => window.history.back()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
              data-testid="button-back-pos"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to POS</span>
            </Button>
            
            <Button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
              data-testid="button-download-invoice"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download Invoice'}</span>
            </Button>
            
            <Button 
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
              data-testid="button-print-invoice"
            >
              <Printer className="h-4 w-4" />
              <span>Print Invoice</span>
            </Button>
          </div>

          {/* Invoice */}
          <Card className="print-invoice print:shadow-none print:border-none">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold text-emerald-700 mb-3">
                    {business.name}
                  </CardTitle>
                  <div className="text-gray-600 space-y-1">
                    {business.email && <p>Email: {business.email}</p>}
                    {business.phone && <p>Phone: {business.phone}</p>}
                    {business.address && <p>{business.address}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p className="text-lg font-semibold text-emerald-700">
                    #{invoice.invoiceNumber}
                  </p>
                  <p className="text-gray-600">
                    Date: {new Date(invoice.orderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold text-lg mb-3">Bill To:</h3>
                  <div className="space-y-1">
                    <p className="font-semibold">{invoice.customerInfo.name}</p>
                    {invoice.customerInfo.email && <p>{invoice.customerInfo.email}</p>}
                    {invoice.customerInfo.phone && <p>{invoice.customerInfo.phone}</p>}
                    {invoice.customerInfo.address && (
                      <p className="text-gray-600">{invoice.customerInfo.address}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-3">Order Details:</h3>
                  <div className="space-y-1">
                    <p><span className="font-medium">Order ID:</span> {invoice.orderId}</p>
                    <p><span className="font-medium">Payment Method:</span> {invoice.paymentMethod}</p>
                    <p>
                      <span className="font-medium">Payment Status:</span>
                      <Badge 
                        variant={invoice.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {invoice.paymentStatus}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Items Ordered:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-3 text-left">Product</th>
                        <th className="border border-gray-300 p-3 text-center">Quantity</th>
                        <th className="border border-gray-300 p-3 text-right">Price</th>
                        <th className="border border-gray-300 p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                              <span className="font-medium">{item.name}</span>
                            </div>
                          </td>
                          <td className="border border-gray-300 p-3 text-center">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-300 p-3 text-right">
                            {currency} {item.price.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-3 text-right font-medium">
                            {currency} {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                  <Separator />
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{currency} {invoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-emerald-700">{currency} {invoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-gray-500">
                <p>Thank you for your business!</p>
                <p className="text-sm">Generated by ZnForge POS System</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}