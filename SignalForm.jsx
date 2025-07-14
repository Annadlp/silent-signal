
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function SignalForm() {
  const [form, setForm] = useState({
    address: '',
    violence_type: [],
    description: '',
    contact_email: '',
    is_anonymous: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!form.is_anonymous && !form.contact_email.trim()) {
      newErrors.contact_email = 'Email is required for non-anonymous reports';
    }
    if (form.contact_email && !/\S+@\S+\.\S+/.test(form.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const loadingToast = toast.loading('Sending signal...');
    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase
        .from('signals')
        .insert([form]);

      if (error) throw error;

      toast.success('Signal sent successfully!', {
        id: loadingToast,
      });

      setForm({
        address: '',
        violence_type: [],
        description: '',
        contact_email: '',
        is_anonymous: true,
      });
    } catch (error) {
      toast.error('Failed to send signal: ' + error.message, {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViolenceTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      violence_type: prev.violence_type.includes(type)
        ? prev.violence_type.filter(t => t !== type)
        : [...prev.violence_type, type]
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input 
          type="text" 
          placeholder="Address" 
          value={form.address}
          onChange={e => setForm({...form, address: e.target.value})} 
          required 
        />
        {errors.address && <span style={{color: 'red'}}>{errors.address}</span>}
      </div>

      <div>
        <label>Violence Type:</label>
        {['Physical', 'Verbal', 'Sexual', 'Psychological'].map(type => (
          <label key={type}>
            <input
              type="checkbox"
              checked={form.violence_type.includes(type)}
              onChange={() => handleViolenceTypeChange(type)}
            />
            {type}
          </label>
        ))}
      </div>

      <div>
        <textarea 
          placeholder="Description" 
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})} 
        />
      </div>

      <div>
        <input 
          type="email" 
          placeholder="Email (optional)" 
          value={form.contact_email}
          onChange={e => setForm({...form, contact_email: e.target.value})} 
        />
        {errors.contact_email && <span style={{color: 'red'}}>{errors.contact_email}</span>}
      </div>

      <div>
        <label>
          <input 
            type="checkbox" 
            checked={form.is_anonymous} 
            onChange={e => setForm({...form, is_anonymous: e.target.checked})} 
          />
          Anonymous
        </label>
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Signal'}
      </button>
    </form>
  );
}
