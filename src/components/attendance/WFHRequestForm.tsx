
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, Home } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WFHRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const WFHRequestForm = ({ onClose, onSuccess }: WFHRequestFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    destination: '',
    purpose: '',
    reason: ''
  });

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const diffTime = Math.abs(formData.endDate.getTime() - formData.startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate || !formData.destination || !formData.purpose) {
      toast({
        title: 'Error',
        description: 'Semua field wajib diisi',
        variant: 'destructive'
      });
      return;
    }

    if (!profile?.employee_id) {
      toast({
        title: 'Error',
        description: 'Data karyawan tidak ditemukan',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('out_of_town_requests')
        .insert({
          employee_id: profile.employee_id,
          employee_name: profile.name,
          start_date: format(formData.startDate, 'yyyy-MM-dd'),
          end_date: format(formData.endDate, 'yyyy-MM-dd'),
          duration_days: calculateDays(),
          destination: formData.destination,
          purpose: formData.purpose,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Berhasil',
        description: 'Pengajuan Work From Home/Anywhere berhasil disubmit'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting WFH request:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengajukan Work From Home/Anywhere',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get today's date at start of day for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="h-5 w-5 mr-2" />
          Pengajuan Work From Home/Anywhere
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date || null }))}
                    disabled={(date) => date < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "dd MMMM yyyy", { locale: id }) : "Pilih tanggal"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date || null }))}
                    disabled={(date) => {
                      const minDate = formData.startDate || today;
                      return date < minDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Durasi:</strong> {calculateDays()} hari
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="destination">Lokasi Kerja</Label>
            <Input
              id="destination"
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              placeholder="Contoh: Rumah, Coworking Space, dll"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Tujuan/Keperluan</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              placeholder="Jelaskan tujuan atau keperluan Work From Home/Anywhere"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Ajukan Permintaan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WFHRequestForm;
