#version 300 es

precision highp float;
precision highp int;

in vec3 fragColor;
// in vec3 fragNormal;
// in vec3 fragPosition;

out vec4 finalColor;

// uniform vec3 dirLightDir;
// uniform vec3 dirLightColor;
// uniform float dirLightIntensity;

void main() {

    // vec3 lightResult = vec3(0.0, 0.0, 0.0);

    // float diffuse = max(dot(normalize(dirLightDir), fragNormal), 0.0);
    // lightResult += dirLightColor * dirLightIntensity * diffuse;

    finalColor = vec4(fragColor ,1.0);
    // finalColor = vec4(vec3(1.0) ,1.0);
}

// //VTK::System::Dec

// // Template for the polydata mappers fragment shader

// uniform int PrimitiveIDOffset;

// // VC position of this fragment
// //VTK::PositionVC::Dec

// // optional color passed in from the vertex shader, vertexColor
// //VTK::Color::Dec

// // optional surface normal declaration
// //VTK::Normal::Dec

// // extra lighting parameters
// //VTK::Light::Dec

// // Texture coordinates
// //VTK::TCoord::Dec

// // picking support
// //VTK::Picking::Dec

// // Depth Peeling Support
// //VTK::DepthPeeling::Dec

// // clipping plane vars
// //VTK::Clip::Dec

// // the output of this shader
// //VTK::Output::Dec

// // Apple Bug
// //VTK::PrimID::Dec

// // handle coincident offsets
// //VTK::Coincident::Dec

// //VTK::ZBuffer::Dec

// void main()
// {
//   // VC position of this fragment. This should not branch/return/discard.
//   //VTK::PositionVC::Impl

//   // Place any calls that require uniform flow (e.g. dFdx) here.
//   //VTK::UniformFlow::Impl

//   // Set gl_FragDepth here (gl_FragCoord.z by default)
//   //VTK::Depth::Impl

//   // Early depth peeling abort:
//   //VTK::DepthPeeling::PreColor

//   // Apple Bug
//   //VTK::PrimID::Impl

//   //VTK::Clip::Impl

//   //VTK::Color::Impl

//   // Generate the normal if we are not passed in one
//   //VTK::Normal::Impl

//   //VTK::TCoord::Impl

//   //VTK::Light::Impl

//   if (gl_FragData[0].a <= 0.0)
//     {
//     discard;
//     }

//   //VTK::DepthPeeling::Impl

//   //VTK::Picking::Impl

//   // handle coincident offsets
//   //VTK::Coincident::Impl

//   //VTK::ZBuffer::Impl

//   //VTK::RenderPassFragmentShader::Impl
// }