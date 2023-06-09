import InputNode from '../core/InputNode.js';
import { addNodeClass } from '../core/Node.js';
import { varying } from '../core/VaryingNode.js';
import { nodeObject } from '../shadernode/ShaderNode.js';
import { InterleavedBufferAttribute, InterleavedBuffer } from 'three';

class BufferAttributeNode extends InputNode {

	constructor( value, bufferType, bufferStride = 0, bufferOffset = 0 ) {

		super( value, bufferType );

		this.isBufferNode = true;

		this.bufferType = bufferType;
		this.bufferStride = bufferStride;
		this.bufferOffset = bufferOffset;

	}

	construct( builder ) {

		const type = this.getNodeType( builder );
		const array = this.value;
		const itemSize = builder.getTypeLength( type );
		const stride = this.bufferStride || itemSize;
		const offset = this.bufferOffset;

		const buffer = new InterleavedBuffer( array, stride );
		const bufferAttribute = new InterleavedBufferAttribute( buffer, itemSize, offset );

		this.attribute = bufferAttribute;
		this.attribute.isInstancedBufferAttribute = true; // @TODO: Add a possible: InstancedInterleavedBufferAttribute

	}

	generate( builder ) {

		const nodeType = this.getNodeType( builder );

		const nodeUniform = builder.getBufferAttributeFromNode( this, nodeType );
		const propertyName = builder.getPropertyName( nodeUniform );

		let output = null;

		if ( builder.isShaderStage( 'vertex' ) ) {

			output = propertyName;

		} else {

			const nodeVarying = varying( this );

			output = nodeVarying.build( builder, nodeType );

		}

		return output;

	}

	getInputType( /*builder*/ ) {

		return 'bufferAttribute';

	}

}

export default BufferAttributeNode;

export const bufferAttribute = ( array, type, stride, offset ) => nodeObject( new BufferAttributeNode( array, type, stride, offset ) );

addNodeClass( BufferAttributeNode );
