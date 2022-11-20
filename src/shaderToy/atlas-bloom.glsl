#iChannel0 "file://media/previz/buffer00.png"
#iChannel1 "file://media/previz/buffer03.png"
#define BLOOM_LEVELS   5
#define BLOOM_STRENGTH 1.0
#define BLOOM_FALLOFF  0.667

vec3 readBloomTile(in sampler2D tex, in vec2 coord, in float lod) {
    // Calculate those values to compute both tile transform and sampling bounds
    float offset = 1.0 - exp2(1.0 - lod);
    float width = exp2(-lod);
    
    // Inverse atlas transform
    coord *= width; // /= exp2(lod)
    coord += offset;
    
    // The single-texel margin is needed to account for linear atlas filtering issues
    // Can be removed if set to nearest, but the bloom will look blocky and awful
    // The bounding without margin is not needed at all, so both shall be removed together
    vec2 bounds = vec2(offset, offset + width);
    vec2 texelSize = 1.0 / vec2(textureSize(tex, 0));
    float margin = max(texelSize.x, texelSize.y);
    bounds.x += margin;
    bounds.y -= margin;
    coord = clamp(coord, bounds.x, bounds.y);
    
    return texture(tex, coord).xyz;
}

vec3 getBloom(in sampler2D tex, in vec2 coord) {
    float weight = 1.0;
        
    vec4 color = vec4(0.0);
    for(int i = 1; i <= BLOOM_LEVELS; i++) {
    	color.xyz += readBloomTile(tex, coord, float(i)) * weight;
        color.w   += weight;
        
        weight *= BLOOM_FALLOFF;
    }
    return color.xyz / color.w;
}

vec3 tonemapACES(in vec3 color) {
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    
    fragColor.xyz  = texture(iChannel0, uv).xyz;
    fragColor.xyz += getBloom(iChannel1, uv) * BLOOM_STRENGTH;
    
    fragColor.xyz  = tonemapACES(fragColor.xyz);
    fragColor.xyz  = pow(fragColor.xyz, vec3(1.0 / 2.2));
    
    fragColor.w    = 1.0;
    
    // fragColor = texture(iChannel1, uv);
}