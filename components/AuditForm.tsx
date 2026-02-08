import React, { useState } from 'react';
import { AuditRequest, AudienceType } from '../types';
import { Search, Loader2, AlertCircle } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: AuditRequest) => void;
  isLoading: boolean;
}

interface FormErrors {
  url?: string;
  description?: string;
  testCreds?: string;
}

const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [testCreds, setTestCreds] = useState('');
  const [audience, setAudience] = useState<AudienceType>(AudienceType.Developer);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateUrl = (value: string): string | undefined => {
    if (!value.trim()) return 'Application URL is required';
    try {
      const urlObj = new URL(value);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'URL must start with http:// or https://';
      }
    } catch {
      return 'Please enter a valid URL (e.g., https://example.com)';
    }
    return undefined;
  };

  const validateDescription = (value: string): string | undefined => {
    if (!value.trim()) return 'Description is required';
    if (value.trim().length < 20) return 'Please provide at least 20 characters of context.';
    if (value.length > 5000) return 'Description is too long (max 5000 characters).';
    return undefined;
  };

  const validateCreds = (value: string): string | undefined => {
    if (value.length > 500) return 'Credentials info is too long.';
    return undefined;
  };

  const sanitizeInput = (input: string) => {
    // Basic sanitization to remove HTML tags to prevent XSS in downstream processing
    return input.replace(/<[^>]*>?/gm, '').trim();
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = { ...errors };
    if (field === 'url') newErrors.url = validateUrl(url);
    if (field === 'description') newErrors.description = validateDescription(description);
    if (field === 'testCreds') newErrors.testCreds = validateCreds(testCreds);
    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const safeUrl = url.trim(); // URLs shouldn't have HTML tags anyway, but trim is key
    const safeDesc = sanitizeInput(description);
    const safeCreds = sanitizeInput(testCreds);

    const urlError = validateUrl(safeUrl);
    const descError = validateDescription(safeDesc);
    const credsError = validateCreds(safeCreds);

    if (urlError || descError || credsError) {
      setErrors({
        url: urlError,
        description: descError,
        testCreds: credsError
      });
      setTouched({ url: true, description: true, testCreds: true });
      return;
    }

    // Submit the sanitized values
    onSubmit({ url: safeUrl, description: safeDesc, testCreds: safeCreds, audience });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-surface border border-gray-700 rounded-xl p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">App Auditor <span className="text-primary">AI</span></h2>
        <p className="text-gray-400">Enter your app details for a comprehensive security, QA, and demo analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">Application URL</label>
          <div className="relative">
            <input
              id="url"
              type="url"
              placeholder="https://myapp.vercel.app"
              className={`w-full bg-gray-900/50 border rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:outline-none transition ${
                touched.url && errors.url 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-primary focus:border-transparent'
              }`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (touched.url) setErrors(prev => ({ ...prev, url: validateUrl(e.target.value) }));
              }}
              onBlur={() => handleBlur('url')}
            />
            {touched.url && errors.url && (
              <div className="flex items-center gap-1 mt-1 text-red-400 text-xs animate-fade-in">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.url}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">App Description / Context</label>
          <textarea
            id="description"
            rows={4}
            placeholder="Describe what your app does, its main features, and the tech stack..."
            className={`w-full bg-gray-900/50 border rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:outline-none transition resize-none ${
               touched.description && errors.description
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-primary focus:border-transparent'
            }`}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (touched.description) setErrors(prev => ({ ...prev, description: validateDescription(e.target.value) }));
            }}
            onBlur={() => handleBlur('description')}
          />
          {touched.description && errors.description && (
             <div className="flex items-center gap-1 mt-1 text-red-400 text-xs animate-fade-in">
               <AlertCircle className="w-3 h-3" />
               <span>{errors.description}</span>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="testCreds" className="block text-sm font-medium text-gray-300 mb-1">Test Credentials (Optional)</label>
            <input
              id="testCreds"
              type="text"
              placeholder="demo_user / pass123"
              className={`w-full bg-gray-900/50 border rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:outline-none transition ${
                  touched.testCreds && errors.testCreds
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-primary focus:border-transparent'
              }`}
              value={testCreds}
              onChange={(e) => {
                 setTestCreds(e.target.value);
                 if (touched.testCreds) setErrors(prev => ({ ...prev, testCreds: validateCreds(e.target.value) }));
              }}
              onBlur={() => handleBlur('testCreds')}
            />
            {touched.testCreds && errors.testCreds && (
             <div className="flex items-center gap-1 mt-1 text-red-400 text-xs animate-fade-in">
               <AlertCircle className="w-3 h-3" />
               <span>{errors.testCreds}</span>
             </div>
            )}
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-1">Target Audience</label>
            <select
              id="audience"
              className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-2.5 px-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none"
              value={audience}
              onChange={(e) => setAudience(e.target.value as AudienceType)}
            >
              {Object.values(AudienceType).map((t) => (
                <option key={t} value={t} className="bg-surface">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 bg-primary hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Application...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Audit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AuditForm;