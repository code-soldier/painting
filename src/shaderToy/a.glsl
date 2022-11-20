// #iChannel0 "file://cat.jpg"
#iChannel0 "file://photo.jpg"
// #iChannel0::WrapMode "Clamp"

float gaussian(vec2 p,float sigma) {
    float fangCha = sigma*sigma;
    return exp( ( p.x*p.x+p.y*p.y ) / fangCha * (-.5) ) / ( 6.28 * fangCha );
}
// float gaussian(vec2 i, float sigma) {
//     return exp( -.5* dot(i/=sigma,i) ) / ( 6.28 * sigma*sigma );
// }

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    int index = 2;
    vec2 uv = fragCoord/iResolution.xy;
    vec2 ip = (2.0 * fragCoord - iResolution.xy) / iResolution.yy;
    vec3 oc = vec3(0);


    if(index==-1) {
        oc = texture(iChannel0, uv).rgb;
    }
    // 高斯模糊
    else if(index==4) {
        int a = 50;
        float sigma = 20.;
        vec2 scale = 1./iResolution.xy;
        for(int i=0;i<a*a;i++){
            vec2 p = vec2(i%a,i/a)-float(a)/2.;
            float weight = gaussian(p,sigma);
            oc += weight * texture(iChannel0, uv+p*scale).rgb;
        }
        oc = oc + .2;
    }

    else if(index==3) {
        vec3 acc = vec3(0);
        float x = fragCoord.x;
        float y = fragCoord.y;
        int t = 40;
        for(int i=0;i<t;i++) {
            acc = acc + texture(iChannel0,vec2((fragCoord.x)/iResolution.x,(fragCoord.y-float(i))/iResolution.y)).rgb;           
        }
        oc = acc / (float(t));
    }
    // 染发
    else if(index==2) {
        oc = texture(iChannel0, uv).rgb;
        float avg = (oc.r+oc.g+oc.b) / 3.0;
        if(avg > 0.0 && avg < 0.2){
            oc = vec3(1,0,0);
        }
    }

     else if(index == 1) {
        if(length(ip)<0.5){
            oc = vec3(1);
        }
        fragColor = vec4(oc,1.0);
    } 
    
    else if(index==0) {
        vec2 st = (fragCoord - 0.5 * iResolution.xy) / iResolution.y + 0.5;
        float circleSDF = length(st - 0.5);
        fragColor = vec4(vec3(0.02 / pow(length(st - 0.5), 1.0)), 1.0);
    }
    fragColor = vec4(oc,1.0);
}