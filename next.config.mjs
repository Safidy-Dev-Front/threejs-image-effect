/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        turbo:{
            rules:{
                "*.glsl":['raw-loader', 'glslify-loader'],
                "*.frag":['raw-loader', 'glslify-loader'],
                "*.vert":['raw-loader', 'glslify-loader']
            },
        }
    }
  };
  
  export default nextConfig;
  