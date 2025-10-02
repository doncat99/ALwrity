from typing import Any, Dict, List


def convert_content_to_ricos(content: str, images: List[str] = None) -> Dict[str, Any]:
    """
    Convert simple markdown-like text into minimal valid Ricos JSON.
    """
    paragraphs = content.split('\n\n')
    nodes = []

    import uuid

    for paragraph in paragraphs:
        text = paragraph.strip()
        if not text:
            continue
        node_id = str(uuid.uuid4())
        text_node_id = str(uuid.uuid4())

        if text.startswith('#'):
            level = len(text) - len(text.lstrip('#'))
            heading_text = text.lstrip('# ').strip()
            nodes.append({
                'id': node_id,
                'type': 'HEADING',
                'nodes': [{
                    'id': text_node_id,
                    'type': 'TEXT',
                    'textData': {
                        'text': heading_text,
                        'decorations': []
                    }
                }],
                'headingData': { 'level': min(level, 6) }
            })
        else:
            nodes.append({
                'id': node_id,
                'type': 'PARAGRAPH',
                'nodes': [{
                    'id': text_node_id,
                    'type': 'TEXT',
                    'textData': {
                        'text': text,
                        'decorations': []
                    }
                }],
                'paragraphData': {}
            })

    return {
        'nodes': nodes,
        'metadata': { 'version': 1, 'id': str(uuid.uuid4()) },
        'documentStyle': {
            'paragraph': { 'decorations': [], 'nodeStyle': {}, 'lineHeight': '1.5' }
        }
    }


