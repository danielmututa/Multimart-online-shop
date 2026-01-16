import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getPendingDocuments, approveDocument, rejectDocument } from "@/api/businessDocumentsApi";
import { toast } from "sonner";
import { FileText, CheckCircle, XCircle, Building2 } from "lucide-react";
// import type { BusinessDocument } from "@/lib/schemas/documents/businessDocuments";

const PendingDocumentsPage = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; documentId: number | null }>({
    open: false,
    documentId: null
  });
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getPendingDocuments();
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (documentId: number) => {
    if (!confirm('Are you sure you want to approve this document?')) return;

    try {
      await approveDocument(documentId);
      toast.success('Document approved successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve document');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog.documentId) return;
    if (!rejectionReason.trim() || rejectionReason.length < 10) {
      toast.error('Please provide a detailed rejection reason (min 10 characters)');
      return;
    }

    try {
      await rejectDocument(rejectDialog.documentId, rejectionReason);
      toast.success('Document rejected');
      setRejectDialog({ open: false, documentId: null });
      setRejectionReason('');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject document');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Pending Business Documents</h1>
        <p className="text-sm text-muted-foreground">Review and approve merchant business documents</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Pending Documents</h3>
            <p className="text-muted-foreground">All documents have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc: any) => (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{doc.merchant?.merchant_name || 'Unknown Merchant'}</h3>
                        <p className="text-sm text-muted-foreground">{doc.merchant?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.document_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.document_type.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Phone:</strong> {doc.merchant?.phone || 'N/A'}</p>
                      <p><strong>Address:</strong> {doc.merchant?.physical_address || 'N/A'}</p>
                      <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      <p><strong>File Size:</strong> {(doc.file_size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      View Document
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(doc.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setRejectDialog({ open: true, documentId: doc.id })}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, documentId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for rejecting this document (min 10 characters)
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Document is expired, image quality is poor, information is not clearly visible..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, documentId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectSubmit}>
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingDocumentsPage;