import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyDocuments, deleteDocument } from "@/services/businessDocuments";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import type { BusinessDocument } from "@/lib/schemas/documents/businessDocuments";

const MyDocumentsPage = () => {
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument(documentId);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" /> Pending</Badge>;
    }
  };

  const hasApprovedDocument = documents.some(doc => doc.approval_status === 'approved');

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Business Documents</h1>
          <p className="text-sm text-muted-foreground">Upload and manage your business verification documents</p>
        </div>
        <Button onClick={() => navigate('/upload-document')}>
          Upload New Document
        </Button>
      </div>

      {!hasApprovedDocument && (
        <Card className="mb-6 border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Documents Required</CardTitle>
            <CardDescription className="text-yellow-700">
              You must have at least one approved business document before you can upload products.
              Documents are reviewed within 7 days.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Documents Yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first business document to get started</p>
            <Button onClick={() => navigate('/upload-document')}>Upload Document</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">{doc.document_name}</h3>
                      {getStatusBadge(doc.approval_status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Type:</strong> {doc.document_type.replace('_', ' ').toUpperCase()}</p>
                      <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                      {doc.approved_at && (
                        <p><strong>Approved:</strong> {new Date(doc.approved_at).toLocaleDateString()}</p>
                      )}
                      {doc.rejection_reason && (
                        <p className="text-red-600"><strong>Rejection Reason:</strong> {doc.rejection_reason}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.document_url, '_blank')}
                    >
                      View
                    </Button>
                    {doc.approval_status === 'pending' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDocumentsPage;