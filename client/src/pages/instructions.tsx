import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';

export default function InstructionsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = window.location.origin;

  const iframeCode = `<iframe 
  src="${baseUrl}/embed" 
  width="100%" 
  height="700" 
  frameborder="0" 
  allow="autoplay"
  style="border-radius: 12px; max-width: 1200px;"
></iframe>`;

  const buttonCode = `<!-- Add this button wherever you want the demo launcher -->
<button 
  id="demo-trigger" 
  onclick="openDemo()"
  style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;"
>
  Watch Demo
</button>

<!-- Demo Modal (add this before closing </body> tag) -->
<div id="demo-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; justify-content: center; align-items: center;">
  <div style="position: relative; width: 95%; max-width: 1200px; height: 90vh; background: white; border-radius: 12px; overflow: hidden;">
    <button onclick="closeDemo()" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.5); color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
    <iframe id="demo-iframe" src="${baseUrl}/embed" width="100%" height="100%" frameborder="0" allow="autoplay"></iframe>
  </div>
</div>

<script>
function openDemo() {
  document.getElementById('demo-modal').style.display = 'flex';
}
function closeDemo() {
  document.getElementById('demo-modal').style.display = 'none';
  // Reset the iframe to stop audio
  var iframe = document.getElementById('demo-iframe');
  iframe.src = iframe.src;
}
</script>`;

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-black mb-4" style={{ lineHeight: 1.2 }}>Embed the AI Demo</h1>
          <p className="text-lg text-[#4D4D4D]">
            Add this interactive demo to your WordPress site or any webpage
          </p>
        </div>

        <div className="space-y-8">
          {/* Direct link */}
          <Card className="bg-white border-[#D9D9D9]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <ExternalLink className="w-5 h-5" />
                Direct Link
              </CardTitle>
              <CardDescription className="text-[#4D4D4D]">
                Share this link directly or open in a new tab
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#F5F5F5] p-3 rounded-md text-sm break-all text-black border border-[#D9D9D9]">
                  {baseUrl}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#D9D9D9] text-black hover:bg-[#F5F5F5]"
                  onClick={() => copyToClipboard(baseUrl, 'link')}
                  data-testid="button-copy-link"
                >
                  {copied === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Simple iframe embed */}
          <Card className="bg-white border-[#D9D9D9]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Code className="w-5 h-5" />
                Simple Embed (iframe)
              </CardTitle>
              <CardDescription className="text-[#4D4D4D]">
                Paste this code into any HTML page or WordPress HTML block
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-[#F5F5F5] p-4 rounded-md text-sm overflow-x-auto text-black border border-[#D9D9D9]">
                  <code>{iframeCode}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 border-[#D9D9D9] text-black hover:bg-white"
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                  data-testid="button-copy-iframe"
                >
                  {copied === 'iframe' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Button + Modal embed */}
          <Card className="bg-white border-[#D9D9D9]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Code className="w-5 h-5" />
                Button Launcher with Modal
              </CardTitle>
              <CardDescription className="text-[#4D4D4D]">
                Creates a button that opens the demo in a modal overlay - perfect for hero sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-[#F5F5F5] p-4 rounded-md text-sm overflow-x-auto max-h-96 text-black border border-[#D9D9D9]">
                  <code>{buttonCode}</code>
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 border-[#D9D9D9] text-black hover:bg-white"
                  onClick={() => copyToClipboard(buttonCode, 'button')}
                  data-testid="button-copy-modal"
                >
                  {copied === 'button' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* WordPress instructions */}
          <Card className="bg-white border-[#D9D9D9]">
            <CardHeader>
              <CardTitle className="text-black">WordPress Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-[#4D4D4D] space-y-4">
              <div>
                <strong className="text-black">For Gutenberg (Block Editor):</strong>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  <li>Add a "Custom HTML" block</li>
                  <li>Paste either the iframe code or the button launcher code</li>
                  <li>Preview and publish</li>
                </ul>
              </div>
              <div>
                <strong className="text-black">For Classic Editor:</strong>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  <li>Switch to "Text" mode (not Visual)</li>
                  <li>Paste the code where you want the demo to appear</li>
                  <li>Update/publish your page</li>
                </ul>
              </div>
              <div>
                <strong className="text-black">For Elementor:</strong>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  <li>Add an HTML widget</li>
                  <li>Paste the code</li>
                  <li>Save and preview</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Back to demo */}
          <div className="text-center pt-8">
            <Button 
              asChild 
              size="lg" 
              className="text-white shadow-lg border-0"
              style={{ backgroundColor: '#017AFF' }}
              data-testid="button-view-demo"
            >
              <a href="/">View the Demo</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
