import os
import subprocess
import tempfile
import re
import shutil
import time

def run_python_code(code: str, timeout: float = 5.0) -> dict:
    """
    Executes Python code in a subprocess with a timeout and returns execution details.
    """
    # Create temporary directory to avoid conflicts
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, "script.py")
    
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        start_time = time.time()
        result = subprocess.run(
            ["python", file_path],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=temp_dir
        )
        elapsed_time = time.time() - start_time
        
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "execution_time_ms": int(elapsed_time * 1000),
            "status": "success" if result.returncode == 0 else "runtime_error"
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Time Limit Exceeded: Execution took longer than {timeout} seconds.",
            "exit_code": -1,
            "execution_time_ms": int(timeout * 1000),
            "status": "timeout"
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Execution Error: {str(e)}",
            "exit_code": -1,
            "execution_time_ms": 0,
            "status": "error"
        }
    finally:
        # Clean up temp directory
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass

def run_java_code(code: str, timeout: float = 5.0) -> dict:
    """
    Compiles and executes Java code in a subprocess.
    Detects the public class name from the code to name the source file.
    """
    # Find public class name
    class_match = re.search(r'public\s+class\s+(\w+)', code)
    if class_match:
        class_name = class_match.group(1)
    else:
        # Fallback to any class name
        any_class_match = re.search(r'class\s+(\w+)', code)
        class_name = any_class_match.group(1) if any_class_match else "Main"
        
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, f"{class_name}.java")
    
    try:
        # Write Java source file
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        # 1. Compile Java file
        start_compile = time.time()
        compile_result = subprocess.run(
            ["javac", f"{class_name}.java"],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=temp_dir
        )
        compile_time = time.time() - start_compile
        
        if compile_result.returncode != 0:
            return {
                "success": False,
                "stdout": "",
                "stderr": compile_result.stderr,
                "exit_code": compile_result.returncode,
                "execution_time_ms": int(compile_time * 1000),
                "status": "compile_error"
            }
            
        # 2. Run Java class
        start_run = time.time()
        run_result = subprocess.run(
            ["java", class_name],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=temp_dir
        )
        run_time = time.time() - start_run
        
        return {
            "success": run_result.returncode == 0,
            "stdout": run_result.stdout,
            "stderr": run_result.stderr,
            "exit_code": run_result.returncode,
            "execution_time_ms": int(run_time * 1000),
            "status": "success" if run_result.returncode == 0 else "runtime_error"
        }
        
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Time Limit Exceeded: Execution took longer than {timeout} seconds.",
            "exit_code": -1,
            "execution_time_ms": int(timeout * 1000),
            "status": "timeout"
        }
    except Exception as e:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Execution Error: {str(e)}",
            "exit_code": -1,
            "execution_time_ms": 0,
            "status": "error"
        }
    finally:
        # Clean up temp directory
        try:
            shutil.rmtree(temp_dir)
        except Exception:
            pass

def execute_code(code: str, language: str) -> dict:
    """
    Orchestrator to route execution to appropriate language runner.
    """
    lang_lower = language.lower()
    if lang_lower == "python" or lang_lower == "py":
        return run_python_code(code)
    elif lang_lower == "java":
        return run_java_code(code)
    else:
        return {
            "success": False,
            "stdout": "",
            "stderr": f"Unsupported language: {language}",
            "exit_code": -1,
            "execution_time_ms": 0,
            "status": "unsupported_language"
        }
