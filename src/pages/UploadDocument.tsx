import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadBusinessDocument } from "@/services/businessDocuments";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UploadDocumentPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'business_license' | 'tax_cert' | 'registration'>('business_license');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      await uploadBusinessDocument(file, { documentType });
      toast.success('Document uploaded! Awaiting admin approval (7 days)');
      navigate('/my-documents');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upload Business Document</h1>
      
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business_license">Business License</SelectItem>
              <SelectItem value="tax_cert">Tax Certificate</SelectItem>
              <SelectItem value="registration">Registration Document</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload File (PDF/Image)</label>
          <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </form>
    </div>
  );
};

export default UploadDocumentPage;