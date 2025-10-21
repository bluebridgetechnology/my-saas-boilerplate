import { Icon } from '@iconify/react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '/api-docs' },
      { name: 'Changelog', href: '/changelog' },
    ],
    tools: [
      { name: 'Image Resizer', href: '/image-resizer' },
      { name: 'Image Cropper', href: '/image-cropper' },
      { name: 'Image Compressor', href: '/image-compressor' },
      { name: 'Image Converter', href: '/image-converter' },
      { name: 'Social Media Presets', href: '/social-presets' },
      { name: 'Background Removal', href: '/background-removal' },
      { name: 'Image Watermark', href: '/image-watermark' },
      { name: 'Batch Processor', href: '/batch-processor' },
      { name: 'Meme Generator', href: '/meme-generator' },
      { name: 'Color Picker', href: '/color-picker' },
      { name: 'Image Editor', href: '/image-editor' },
      { name: 'Advanced Crop', href: '/advanced-crop' },
      { name: 'Filters & Effects', href: '/filters' },
      { name: 'Text Overlay', href: '/text-overlay' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'GDPR Compliance', href: '/gdpr' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'solar:twitter-bold-duotone', href: 'https://twitter.com/resizesuite' },
    { name: 'LinkedIn', icon: 'solar:linkedin-bold-duotone', href: 'https://linkedin.com/company/resizesuite' },
    { name: 'GitHub', icon: 'solar:github-bold-duotone', href: 'https://github.com/resizesuite' },
  ];

  // Split tools into two columns for better balance
  const toolsPerColumn = Math.ceil(footerLinks.tools.length / 2);
  const toolsColumn1 = footerLinks.tools.slice(0, toolsPerColumn);
  const toolsColumn2 = footerLinks.tools.slice(toolsPerColumn);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo_dark.png" 
                alt="ResizeSuite" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Professional image processing tools that work instantly. 
              100% private, no server uploads, instant results.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  <Icon icon={social.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools Links - Column 1 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Tools</h3>
            <ul className="space-y-3">
              {toolsColumn1.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools Links - Column 2 */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">&nbsp;</h3>
            <ul className="space-y-3">
              {toolsColumn2.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} ResizeSuite. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span className="flex items-center space-x-2">
                <Icon icon="solar:shield-check-bold-duotone" className="h-4 w-4 text-green-500" />
                <span>GDPR Compliant</span>
              </span>
              <span className="flex items-center space-x-2">
                <Icon icon="solar:lock-bold-duotone" className="h-4 w-4 text-blue-500" />
                <span>100% Private</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
